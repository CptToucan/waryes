import {customElement, state} from 'lit/decorators.js';
import {html, css, TemplateResult} from 'lit';
import {ArmouryWithTransportCard} from '../deck/armoury-with-transport-card';
import {Unit} from '../../types/unit';
import {getVeterancyName} from '../../utils/get-icon-for-veterancy';
import {getIconForTrait} from '../../utils/get-icon-for-trait';
import {Pack, UnitCategory} from '../../types/deck-builder';
import {DialogOpenedChangedEvent} from '@vaadin/dialog';
import {dialogHeaderRenderer, dialogRenderer} from '@vaadin/dialog/lit.js';
import {Deck} from '../../classes/deck';
import {getIconsWithFallback} from '../../utils/get-icons-with-fallback';
import './deck-draft-info-panel';
import {getCodeForFactoryDescriptor} from '../../utils/get-code-for-factory-descriptor';

@customElement('deck-draft-unit-select-card')
export class DeckDraftUnitSelectCard extends ArmouryWithTransportCard {
  static styles = [
    css`
      :host {
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;
      }

      .main {
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;
        background-color: var(--lumo-contrast-10pct);
        border-radius: var(--lumo-border-radius-l);
        overflow: hidden;
      }

      .veterancy {
        text-transform: uppercase;
        font-size: var(--lumo-font-size-l);
        color: var(--lumo-contrast-70pct);
      }

      .name {
        font-size: var(--lumo-font-size-xl);
        font-weight: bold;
      }

      .availability {
        font-size: var(--lumo-font-size-xl);
        color: var(--lumo-contrast-70pct);
      }

      .units {
        display: flex;
        flex-direction: row;
        gap: var(--lumo-space-s);
      }

      .detail-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--lumo-space-xs);
        padding: var(--lumo-space-s);
        border-bottom: 1px solid var(--lumo-contrast-10pct);
      }

      .detail-grid > * {
        display: flex;
        align-items: center;
      }

      .unit-image-container {
        position: relative;
      }

      .command-points {
        font-size: var(--lumo-font-size-xl);
        font-weight: bold;
      }

      .traits {
        display: flex;
        flex-direction: column-reverse;
        position: absolute;
        bottom: 0;
        right: 0;
        top: 0;
        width: 20%;
        align-items: flex-end;
        justify-content: flex-start;
        padding: var(--lumo-space-s);
        gap: var(--lumo-space-s);
      }

      .category-icon {
        bottom: 0;
        left: 0;
        position: absolute;
        font-size: var(--lumo-font-size-xl);
        padding: var(--lumo-space-s);
      }

      .card-body {
        display: flex;
        flex-direction: column;
        padding: var(--lumo-space-s) var(--lumo-space-m);
        justify-content: space-between;
        flex: 1 1 auto;
      }

      weapon-image {
        width: 25%;
      }

      /**
        add gradient foreground to unit image
      */
      .unit-image-container::before {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 50%;
        background-image: linear-gradient(
          to top,
          rgba(0, 0, 0, 0.9),
          rgba(0, 0, 0, 0)
        );
      }

      .bar {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
      }

      .space-evenly {
        justify-content: space-evenly;
      }

      .transport-name {
        display: flex;
        justify-content: flex-end;
      }

      .text-padding {
        padding-top: var(--lumo-space-xs);
        padding-bottom: var(--lumo-space-xs);
      }

      unit-image {
        width: 100%;
        overflow: hidden;
      }

      .rounded-border {
        border-radius: var(--lumo-border-radius-l);
        overflow: hidden;
      }

      .transport-container {
        display: flex;
        font-size: var(--lumo-font-size-m);
      }

      .transport-container > * {
        flex: 1 1 50%;
      }

      .stat-name {
        color: var(--lumo-contrast-60pct);
      }

      .slot-cost {
        font-size: var(--lumo-font-size-xl);
        display: flex;
        justify-content: space-between;
        padding-left: var(--lumo-space-s);
        padding-right: var(--lumo-space-s);
      }

      .cost {
        font-weight: bold;
      }

      .info-icon-button {
        position: absolute;
        top: var(--lumo-space-xs);
        right: var(--lumo-space-xs);

        margin: 0;
        border-bottom-left-radius: var(--lumo-border-radius-s);
        --lumo-primary-color: hsla(240, 7%, 11%, 0.8);
        padding: 0;
      }

      @media (max-width: 1000px) {
        :host {
          --lumo-font-size-xxs: 0.5625rem;
          --lumo-font-size-xs: 0.6094rem;
          --lumo-font-size-s: 0.6563rem;
          --lumo-font-size-m: 0.75rem;
          --lumo-font-size-l: 0.8438rem;
          --lumo-font-size-xl: 1.0313rem;
          --lumo-font-size-xxl: 1.3125rem;
          --lumo-font-size-xxxl: 1.875rem;
          --lumo-line-height-xs: 0.9375;
          --lumo-line-height-s: 1.0313;
          --lumo-line-height-m: 1.2188;
        }
      }
    `,
  ];

  render(): TemplateResult {
    if (this.pack && this.deck) {
      const unit = this.deck.getUnitForPack(this.pack);
      const veterancyQuantities = Deck.getVeterancyQuantitiesForPack(
        this.pack
      );

      if (unit) {
        let cmdPoints = unit.commandPoints;

        if (this.transport) {
          cmdPoints += this.transport.commandPoints;
        }

        const category = unit.factoryDescriptor as UnitCategory;

        return html`
          ${this.transport ? this.renderTransportModal(this.transport) : ''}
          <div class="veterancy"
            >${getVeterancyName(this.activeVeterancy)}</div>
          <div class="bar">
            <div class="name">${unit.name}</div><div class="availability"
              >x${veterancyQuantities[this.activeVeterancy]}</div>
          </div>
          <div class="main">
            ${this.renderUnitImageContainer(unit, this.pack, this.deck, this.activeVeterancy)}
            <unit-armor-view .unit=${unit}></unit-armor-view>
            <div class="bar space-evenly" style="height: 40px;">
              ${unit.weapons.map((weapon) => {
                return html`<weapon-image .weapon=${weapon}></weapon-image>`;
              })}
            </div>
            <div class="card-body">
              <deck-draft-info-panel .unit=${unit}></deck-draft-info-panel>
              ${this.renderTransport()}
              <div class="bar">
                <div></div>
                <div class="command-points">${cmdPoints} PTS</div>
              </div>
            </div>
          </div>
          <div class="slot-cost">
            <div class="stat-name">Slot Cost</div>

            <div class="cost">
              ${getCodeForFactoryDescriptor(category)}
              ${this.deck.getNextSlotCostForCategory(category)}
            </div>
          </div>
        `;
      }
    }
    return html`NO PACK OR NO DECK`;
  }

  renderTransport() {
    if (!this.transport || !this.pack || !this.deck) {
      return html``;
    }

    return html`
      <div class="transport-container">
        <div class="stat-name text-padding">Transport</div>
        <div>
          <div class="transport-name text-padding">${this.transport.name}</div>
          ${this.renderUnitImageContainer(
            this.transport,
            this.pack,
            this.deck,
            this.activeVeterancy,
            this.openTransport.bind(this),
            true
          )}
        </div>
      </div>
    `;
  }

  renderUnitImageContainer(
    unit: Unit,
    pack: Pack,
    deck: Deck,
    activeVeterancy: number,
    callback?: () => void,
    roundEdges = false
  ) {
    const icons = getIconsWithFallback(unit);
    return html`
      <div class="unit-image-container ${roundEdges ? 'rounded-border' : ''}">
        <div class="traits">
          ${unit.specialities.length > 1
            ? unit.specialities.slice(1).map((trait) => getIconForTrait(trait))
            : ''}
        </div>
        <div class="category-icon">
          <vaadin-icon icon=${icons.icon}></vaadin-icon>
        </div>
        ${this.renderInfoIcon(unit, pack, deck, activeVeterancy, callback)}
        <unit-image .unit=${unit}></unit-image>
      </div>
    `;
  }

  @state()
  transportDialogOpened = false;

  private openTransport() {
    this.transportDialogOpened = true;
  }

  private closeTransport() {
    this.transportDialogOpened = false;
  }

  renderTransportModal(_unit: Unit) {
    return html`<vaadin-dialog
      aria-label="Unit Details"
      draggable
      modeless
      resizable
      .opened="${this.transportDialogOpened}"
      @opened-changed="${(event: DialogOpenedChangedEvent) => {
        this.transportDialogOpened = event.detail.value;
      }}"
      ${dialogHeaderRenderer(
        () => html`
          <div class="display: flex; justify-content: flex-end;">
            <vaadin-button @click="${this.closeTransport}" theme="tertiary icon"
              ><vaadin-icon icon="vaadin:close"></vaadin-icon
            ></vaadin-button>
          </div>
        `,
        []
      )}
      ${dialogRenderer(
        () => html` <unit-card .unit=${_unit}></unit-card> `,
        [_unit]
      )}
    ></vaadin-dialog>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'deck-draft-unit-select-card': DeckDraftUnitSelectCard;
  }
}
