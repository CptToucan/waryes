import {css, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {Deck} from '../../classes/deck';
import {Pack} from '../../types/deck-builder';
import {Unit} from '../../types/unit';
import {getIconForUnit} from '../../utils/get-icon-for-unit';
import {ArmouryCard} from './armoury-card';
import './transport-selection';

export interface ArmouryCardOptions {
  unit: Unit;
  transport?: Unit;
  veterancyOptions?: ArmouryCardVeterancyOptions;
}

export interface ArmouryCardVeterancyOptions {
  unitQuantityMultipliers: number[];
  defaultUnitQuantity: number;
}

@customElement('armoury-with-transport-card')
export class ArmouryWithTransportCard extends ArmouryCard {
  static styles = [
    ArmouryCard.styles,
    css`
      .bottom-section {
        display: flex;
        flex-direction: column;
      }

      .bottom-section > span {
        text-align: left;
      }

      .details-row {
        display: flex;
        justify-content: space-between;
        flex: 1 0 auto;
      }

      .details-row vaadin-icon {
        margin-right: var(--lumo-space-xs);
      }

      .details-row > span {
        font-size: var(--lumo-font-size-s);
        font-size: 0.6rem;
      }

      .details-row > span.unit-name {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        flex: 1 1 auto;
      }

      .details-row > span.unit-points {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        flex: 0 0 auto;
        text-align: right;
      }


      .transport-settings {
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .unit-wrapper {
        display: flex;
        flex-direction: row;
      }

      .unit-details {
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
        width: calc(100% - 24px);
      }

      .category-icon {
        font-size: 48px;
      }
    `,
  ];

  @property()
  transport?: Unit;

  transportChangeClicked() {
    this.dispatchEvent(new CustomEvent('transport-change-clicked', {}));
  }

  clickedRemoveButton(unit: Unit) {
    this.dispatchEvent(new CustomEvent('unit-removed', {detail: unit}));
  }

  renderRemainingQuantity() {
    return html``;
  }

  renderCommandPoints(unit: Unit, _pack: Pack, _deck: Deck) {
    let commandPoints = unit.commandPoints;

    if (this.transport) {
      commandPoints += this.transport.commandPoints;
    }
    return html` <div class="points">${commandPoints}</div>`;
  }

  renderButton(_activeVeterancy: number, unit: Unit, _pack: Pack, _deck: Deck) {
    if (unit) {
      return html` <vaadin-button
        class="add-button"
        ?disabled=${false}
        theme="icon small primary"
        aria-label="Remove unit from deck"
        style="padding: 0;"
        @click=${() => this.clickedRemoveButton(unit)}
      >
        <vaadin-icon icon="vaadin:minus"></vaadin-icon>
      </vaadin-button>`;
    }
    return html`No unit found`;
  }

  renderBottomSection(
    activeVeterancy: number,
    numberOfUnitInPackXPMultiplier: number[],
    unit: Unit,
    _pack: Pack,
    _deck: Deck
  ) {
    let unitHtml = html`<div class="details-row">
      <span class="unit-name"
        ><vaadin-icon icon=${getIconForUnit(unit)}></vaadin-icon
        >${unit.name}</span><span class="unit-points">${unit.commandPoints}</span>
    </div>`;

    if (this.transport) {
      unitHtml = html`${unitHtml}
        <div class="details-row">
          <span class="unit-name"
            ><vaadin-icon icon=${getIconForUnit(this.transport)}></vaadin-icon
            >${this.transport?.name}</span><span class="unit-points">${this.transport.commandPoints}</span>
        </div>`;
    }
    return html`
      <div class="bottom-section">
        <div class="unit-wrapper">
          ${this.transport ? this.renderTransportSelectionButton() : html``}

          <div class="unit-details">${unitHtml}</div>
        </div>
      </div>
      ${this.renderVeterancySelection(
        activeVeterancy,
        numberOfUnitInPackXPMultiplier
      )}
    `;
  }

  renderTransportSelectionButton() {
    return html`<div class="transport-settings">
      <vaadin-button
        theme="tertiary small"
        style="padding: 0;"
        @click=${() => {
          this.transportChangeClicked();
        }}
      >
        <vaadin-icon style="font-size: 16px;" icon="vaadin:cog-o"></vaadin-icon>
      </vaadin-button>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'armoury-with-transport-card': ArmouryWithTransportCard;
  }
}
