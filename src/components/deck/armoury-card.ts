import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import '@vaadin/icon';
import {Pack} from '../../types/deck-builder';
import {Unit, UnitMap} from '../../types/unit';
import '@vaadin/menu-bar';

type IconMap = {
  [key: string]: string;
};

const iconMap: IconMap = {
  hq: 'command',
  hq_veh: 'command',
  hq_inf: 'command',
  hq_tank: 'command',
  reco: 'recon',
  AT: 'at',
  supply: 'supply',
  transport: 'transport',
  infantry: 'infantry',
  engineer: 'assault-infantry',
  mortar: 'mortar',
  howitzer: 'artillery',
  armor: 'tank',
  AA: 'aa',
  sead: 'sead',
};

const veterancy: string[] = ['recruit', 'trained', 'veteran', 'elite'];

@customElement('armoury-card')
export class ArmouryCard extends LitElement {
  static get styles() {
    return css`
      :host {
        background-color: var(--lumo-contrast-5pct);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: stretch;

        border-radius: var(--lumo-border-radius-m);
        padding-left: var(--lumo-space-xs);
        padding-right: var(--lumo-space-xs);
        padding-top: var(--lumo-space-xs);
        padding-bottom: var(--lumo-space-xs);
        overflow: hidden;
        height: 140px;
        color: white;
      }

      .body {
        width: 100%;
        display: flex;
        flex-direction: row;
      }

      .veterancy {
        display: flex;
        flex-direction: row;
        width: 100%;
      }

      .veterancy > div:not(:last-child) {
        border-right: 1px solid var(--lumo-contrast-10pct);
      }

      .veterancy > div {
        flex: 1 1 100%;
        text-align: center;
        padding: var(--lumo-space-xs);
        cursor: pointer;
        border: 1px solid transparent;
      }

      .veterancy > div.active {
        background-color: var(--lumo-contrast-10pct);
        border: 1px solid var(--lumo-primary-color-50pct);
      }

      .veterancy > div.disabled {
        opacity: 20%;
        cursor: initial;
      }

      .points {
        position: absolute;
        bottom: 0;
        right: 0;
        color: var(--lumo-primary-color);
      }

      .add-button {
        position: absolute;
        top: 0;
        left: 0;
        margin: 0;
      }

      .info-icon {
        position: absolute;
        top: 4px;
        right: 4px;
        color: var(--lumo-contrast-70pct);
        height: 18px;
        width: 18px;
      }

      .name {
        padding-left: var(--lumo-space-s);
        padding-right: var(--lumo-space-s);
        font-size: 12px;
        display: flex;
        align-items: center;
        text-align: center;
        height: 30px;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .quantity {
        color: white;
        position: absolute;
        bottom: 0;
        left: 0;
        color: var(--lumo-contrast-70pct);
      }

      .top-section {
        display: flex;
        position: relative;
        align-items: center;
        justify-content: center;
        padding-top: var(--lumo-space-xs);
        width: 100%;
        border-bottom: 1px solid var(--lumo-contrast-10pct);
      }

      .bottom-section {
        display: flex;
        align-items: space-between;
        justify-content: center;
        width: 100%;
        flex: 1 1 100%;
        border-bottom: 1px solid var(--lumo-contrast-10pct);
      }
    `;
  }

  @property()
  pack?: Pack;

  @property()
  unitMap?: UnitMap;

  @state()
  selectedVeterancy?: number;

  clickedAddButton(unit: Unit, veterancy: number) {
    console.log(unit, veterancy);
    /*
    if(this.pack) {
      
      const unit: Unit = this.unitMap?.[this.pack.unitDescriptor];

      console.log(unit, this.);
    }
    else {
      console.error("No pack to add");
    }
  */ 
    // this.dispatchEvent(new CustomEvent("unit-added", {}))
  }

  render(): TemplateResult {
    if (this.unitMap && this.pack?.unitDescriptor && this.pack !== undefined) {
      const unit: Unit = this.unitMap?.[this.pack.unitDescriptor];
      const unitPackMultipliers = this.pack.numberOfUnitInPackXPMultiplier;

      const defaultVeterancy = unitPackMultipliers.findIndex(
        (multiplier) => multiplier === 1
      );

      // This is the veterancy to use when firing the add action
      let activeVeterancy = defaultVeterancy;

      if (this.selectedVeterancy !== undefined) {
        activeVeterancy = this.selectedVeterancy;
      }

      const numberOfUnitsInPacksAfterXPMultiplier = unitPackMultipliers.map((multiplier) => Math.round(multiplier * (this?.pack?.numberOfUnitsInPack || 0)))

      let icon;

      if (iconMap[unit.specialities[0]] !== undefined) {
        icon = iconMap[unit.specialities[0]];
      } else if (unit.category === 'air') {
        icon = 'jet';
      } else {
        icon = 'support';
      }

      return html`
        <div class="body">
          <div class="top-section">
            <vaadin-button
              class="add-button"
              theme="icon medium secondary"
              aria-label="Add unit"
              style="padding: 0;"
              @click=${() => this.clickedAddButton(unit, activeVeterancy)}
            >
              <vaadin-icon icon="vaadin:plus"></vaadin-icon>
            </vaadin-button>

            <vaadin-icon
              class="info-icon"
              icon="vaadin:info-circle-o"
            ></vaadin-icon>

            <div class="points">${unit?.commandPoints}</div>
            <vaadin-icon
              style="font-size: 48px;"
              icon="waryes-svg:${icon}"
            ></vaadin-icon>
            <div class="quantity">x${numberOfUnitsInPacksAfterXPMultiplier[activeVeterancy]}</div>
          </div>
        </div>

        <div class="bottom-section">
          <div class="name">${unit?.name}</div>
        </div>

        <div class="veterancy">
          ${veterancy.map((rank, index) => {

            const isDisabled = numberOfUnitsInPacksAfterXPMultiplier[index] === 0;

            return html`<div
              role="button"
              @click=${() => (isDisabled ? null : this.selectedVeterancy = index)}
              class="${activeVeterancy === index ? 'active' : ''} ${isDisabled ? 'disabled' : ''}"
            >
              <vaadin-icon
                style=${rank !== 'elite' ? 'transform: rotate(180deg)' : ''}
                icon="waryes-svg:${rank}"
              ></vaadin-icon>
            </div>`;
          })}
        </div>
      `;
    } else {
      return html`ERROR`;
    }
  }
}
