import {css, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {Deck} from '../../classes/deck';
import {Pack} from '../../types/deck-builder';
import {Unit} from '../../types/unit';
import {getIconForUnit, getSubIconForUnit} from '../../utils/get-icon-for-unit';
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
      }

      .details-row > span {
        font-size: var(--lumo-font-size-s);
      }

      .top-section {
        height: 64px;
      }

      .quantity {
        right: 2.5rem;
        left: initial;
        padding-left: var(--lumo-space-xs);
        padding-right: var(--lumo-space-xs);
        border-right: 1px solid var(--lumo-contrast-20pct);
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
        flex: 1 1 100%;
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

  renderUnitIcon(unit: Unit) {
    let subIcon = null;
    if (unit.category === 'air' || unit.category === 'hel' || unit.category === 'rec' ) {
      const subIconSvg = getSubIconForUnit(unit);
      subIcon = html`<vaadin-icon
        class="unitSubIcon smaller ${this.transport ? 'transport' : '' }"
        icon="${subIconSvg}"
      ></vaadin-icon>`;
    }

    const unitIcon = html`<div></div><vaadin-icon
      class="category-icon"
      icon=${getIconForUnit(unit)}
    ></vaadin-icon>
      ${subIcon}
    </div>`;

    if (this.transport) {
      return html`${unitIcon}
        <vaadin-icon
        class="category-icon"
          icon=${getIconForUnit(this.transport)}
        ></vaadin-icon>`;
    }

    return unitIcon;
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
        theme="icon medium secondary"
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
      <span
        ><vaadin-icon icon=${getIconForUnit(unit)}></vaadin-icon
        >${unit.name}</span
      ><span>${unit.commandPoints}</span>
    </div>`;

    if (this.transport) {
      unitHtml = html`${unitHtml}
        <div class="details-row">
          <span
            ><vaadin-icon icon=${getIconForUnit(this.transport)}></vaadin-icon
            >${this.transport?.name}</span
          ><span>${this.transport.commandPoints}</span>
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
        <vaadin-icon style="font-size: 24px;" icon="vaadin:cog-o"></vaadin-icon>
      </vaadin-button>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'armoury-with-transport-card': ArmouryWithTransportCard;
  }
}
