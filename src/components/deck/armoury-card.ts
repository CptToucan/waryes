import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import '@vaadin/icon';
// import {Pack} from '../../types/deck-builder';
import {Unit} from '../../types/unit';
import '@vaadin/dialog';
import {getIconForUnit} from '../../utils/get-icon-for-unit';
import {getQuantitiesForUnitVeterancies} from '../../utils/get-quantities-for-unit-veterancies';
import { getIconForVeterancy } from '../../utils/get-icon-for-veterancy';
// import {dialogFooterRenderer, dialogRenderer} from '@vaadin/dialog/lit.js';

export interface ArmouryCardOptions {
  unit: Unit;
  veterancyOptions?: ArmouryCardVeterancyOptions;
}

export interface ArmouryCardVeterancyOptions {
  unitQuantityMultipliers: number[];
  defaultUnitQuantity: number;
}

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
  options?: ArmouryCardOptions;

  @state()
  selectedVeterancy?: number;

  clickedAddButton(unit: Unit, veterancy?: number) {
    // Fire event
    this.dispatchEvent(
      new CustomEvent('add-button-clicked', {
        detail: {unit, veterancy},
      })
    );
  }

  // Unit quantity for veterancy determines OR XP Multiplier for veterancy is enabled
  // XP Multiplier determines what the default veterancy setting is

  render(): TemplateResult {
    if (this.options) {
      const unit: Unit = this.options.unit;

      const icon = getIconForUnit(unit);

      let veterancySelection: TemplateResult = html``;
      let quantityDisplaySelection: TemplateResult = html``;
      let activeVeterancy: number | undefined = undefined;

      if (this.options?.veterancyOptions) {
        const unitVeterancyQuantityMultipliers =
          this.options.veterancyOptions.unitQuantityMultipliers;
        const defaultVeterancy = unitVeterancyQuantityMultipliers.findIndex(
          (multiplier) => multiplier === 1
        );

        // This is the veterancy to use when firing the add action
        activeVeterancy = defaultVeterancy;

        if (this.selectedVeterancy !== undefined) {
          activeVeterancy = this.selectedVeterancy;
        }

        const numberOfUnitsInPacksAfterXPMultiplier =
          getQuantitiesForUnitVeterancies(this.options.veterancyOptions);

        veterancySelection = html`<div class="veterancy">
          ${[0,1,2,3].map((_, index) => {
            const isDisabled =
              numberOfUnitsInPacksAfterXPMultiplier[index] === 0;

            return html`<div
              role="button"
              @click=${() =>
                isDisabled ? null : (this.selectedVeterancy = index)}
              class="${activeVeterancy === index ? 'active' : ''} ${isDisabled
                ? 'disabled'
                : ''}"
            >
            ${getIconForVeterancy(index)}
            
            </div>`;
          })}
        </div>`;

        quantityDisplaySelection = html`<div class="quantity">
          x${numberOfUnitsInPacksAfterXPMultiplier[activeVeterancy]}
        </div>`;
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
            <vaadin-icon style="font-size: 48px;" icon="${icon}"></vaadin-icon>

            ${quantityDisplaySelection}
          </div>
        </div>

        <div class="bottom-section">
          <div class="name">${unit?.name}</div>
        </div>

        ${veterancySelection}
      `;
    }

    return html`ERROR`;
  }
}

/*


*/
