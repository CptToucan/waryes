import { css, html } from 'lit';
import {customElement, property} from 'lit/decorators.js';
import { Deck } from '../../classes/deck';
import { Pack } from '../../types/deck-builder';
import {Unit} from '../../types/unit';
import { getIconForUnit } from '../../utils/get-icon-for-unit';
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

      .top-section {
        height: 48px;
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
        display: flex; flex-direction: row;
      }

      .unit-details {
        flex: 1 1 100%;
      }
    `,
  ];

  @property()
  transport?: Unit;

  transportChangeClicked() {
    this.dispatchEvent(new CustomEvent("transport-change-clicked", {
    }))
  }

  clickedRemoveButton(unit: Unit) {
    this.dispatchEvent(new CustomEvent('unit-removed', {detail: unit}));
  }

  renderUnitIcon(unit: Unit) {
    const unitIcon = html`<vaadin-icon
      style="font-size: 32px;"
      icon=${getIconForUnit(unit)}
    ></vaadin-icon>`;

    if (this.transport) {
      return html`${unitIcon}
        <vaadin-icon
          style="font-size: 32px;"
          icon=${getIconForUnit(this.transport)}
        ></vaadin-icon>`;
    }

    return unitIcon;
  }


  renderRemainingQuantity() {
    return html``
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

  renderBottomSection(activeVeterancy: number, numberOfUnitInPackXPMultiplier: number[], unit: Unit, _pack: Pack, _deck: Deck) {
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
            ><vaadin-icon
              icon=${getIconForUnit(this.transport)}
            ></vaadin-icon
            >${this.transport?.name}</span
          ><span>${this.transport.commandPoints}</span>
        </div>`;
    }
    return html`
      <div class="bottom-section">
        <div class="unit-wrapper">
          ${this.transport
            ? html`<div class="transport-settings">
                <vaadin-button
                  theme="tertiary small"
                  style="padding: 0;"
                  @click=${() => {this.transportChangeClicked()}}
                >
                  <vaadin-icon
                    style="font-size: 24px;"
                    icon="vaadin:cog-o"
                  ></vaadin-icon>
                </vaadin-button>
              </div>`
            : html``}

          <div class="unit-details">${unitHtml}</div>
        </div>
      </div>
      ${this.renderVeterancySelection(activeVeterancy, numberOfUnitInPackXPMultiplier)}
    `;
  }

}

declare global {
  interface HTMLElementTagNameMap {
    'armoury-with-transport-card': ArmouryWithTransportCard;
  }
}

/**
 * Renders units that are currently active in the selected deck, gives ability to change which transport is selected.
 */
/*
@customElement('armoury-with-transport-card')
export class ArmouryWithTransportCard extends ArmouryCard {
  @property()
  options?: ArmouryCardOptions;

  @property()
  pack?: Pack;

  @property()
  availableTransports?: ArmouryCardOptions[];

  @query('transport-selection')
  transportDialog!: TransportSelection;

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

      .top-section {
        height: 48px;
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
        display: flex; flex-direction: row;"
      }

      .unit-details {
        flex: 1 1 100%;
      }
    `,
  ];

  transportSelected(transport: Unit) {
    this.dispatchEvent(new CustomEvent("transport-changed", {
      detail: {transport}
    }));
    this.transportDialog.closeTransportDialog();
  }

  clickedRemoveButton(unit: Unit) {
    this.dispatchEvent(new CustomEvent('unit-removed', {detail: unit}));
  }

  
  renderBottomSection(unit: Unit, veterancySelection: TemplateResult) {
    let unitHtml = html`<div class="details-row">
      <span
        ><vaadin-icon icon=${getIconForUnit(unit)}></vaadin-icon
        >${unit.name}</span
      ><span>${unit.commandPoints}</span>
    </div>`;

    if (this.options?.transport) {
      unitHtml = html`${unitHtml}
        <div class="details-row">
          <span
            ><vaadin-icon
              icon=${getIconForUnit(this.options?.transport)}
            ></vaadin-icon
            >${this.options?.transport?.name}</span
          ><span>${this.options?.transport?.commandPoints}</span>
        </div>`;
    }
    return html`
      <transport-selection
        .availableTransports=${this.availableTransports}
        @transport-selected=${(event: CustomEvent) =>
          this.transportSelected(event.detail.transport)}
      ></transport-selection>
      <div class="bottom-section">
        <div class="unit-wrapper">
          ${this.options?.transport
            ? html`<div class="transport-settings">
                <vaadin-button
                  theme="tertiary small"
                  style="padding: 0;"
                  @click=${() => this.transportDialog.showTransportDialog()}
                >
                  <vaadin-icon
                    style="font-size: 24px;"
                    icon="vaadin:cog-o"
                  ></vaadin-icon>
                </vaadin-button>
              </div>`
            : html``}

          <div class="unit-details">${unitHtml}</div>
        </div>
      </div>
      ${veterancySelection}
    `;
  }
  

  
  renderCommandPoints(unit: Unit) {
    let commandPoints: number = unit.commandPoints;

    if (this.options?.transport) {
      commandPoints += this.options.transport.commandPoints;
    }

    return html` <div class="points">${commandPoints}</div>`;
  }
  

  
  renderUnitIcon(unit: Unit) {
    const unitIcon = html`<vaadin-icon
      style="font-size: 32px;"
      icon=${getIconForUnit(unit)}
    ></vaadin-icon>`;

    if (this.options?.transport) {
      return html`${unitIcon}
        <vaadin-icon
          style="font-size: 32px;"
          icon=${getIconForUnit(this.options.transport)}
        ></vaadin-icon>`;
    }

    return unitIcon;
  }
  
}


declare global {
  interface HTMLElementTagNameMap {
    'armoury-with-transport-card': ArmouryWithTransportCard;
  }
}
*/
// ?disabled=${disabled}
// @click=${() => this.clickedMinusButton(unit, activeVeterancy)}
