import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '../division-flag';
import '../country-flag';
import {Deck} from '../../classes/deck';
import './deck-title';

@customElement('deck-header')
export class DeckHeader extends LitElement {
  static get styles() {
    return css`
      .header {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: space-between;
        font-size: var(--lumo-font-size-m);
        flex: 1 1 50%;
      }

      .toolbar {
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        align-items: center;
        column-gap: var(--lumo-space-m);
        width: 100%;
      }

      .deck-summary {
        display: flex;
        flex-direction: row;
        column-gap: var(--lumo-space-s);
        justify-content: space-between;
        flex: 1 1 100%;
        flex-wrap: wrap;
      }

      .deck-summary > * {
        display: flex;
        flex-wrap: nowrap;
        white-space: nowrap;
      }

      .toolbar-slot {
        float: right;
      }

      @media (max-width: 800px) {
        .toolbar-slot {
          width: 200px;
        }

        .toolbar {
          font-size: var(--lumo-font-size-xs);
        }
      }

      @media (max-width: 600px) {
        .toolbar-slot {
          width: 80px;
        }
      }
    `;
  }

  @property()
  deck?: Deck;

  @property()
  name = '';

  render(): TemplateResult {
    if (!this.deck) return html`No deck to view`;
    return html`
      <div class="header">
        <slot name="title">
          <deck-title
            .deck=${this.deck}
            .name=${this.name
              ? this.name
              : this.deck.division.name ?? this.deck.division.descriptor}
          ></deck-title>
        </slot>

        <div class="toolbar">
          <div class="deck-summary">
            <span class="activation-points">
              ${this.deck.totalSpentActivationPoints} /
              ${this.deck.division.maxActivationPoints} Activation Points
            </span>
            <div class="total-unit-cost">
              ${this.deck.getSumOfUnitsCosts()} points
            </div>
          </div>

          <div class="toolbar-slot">
            <slot name="toolbar"></slot>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'deck-header': DeckHeader;
  }
}
