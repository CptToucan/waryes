import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '../division-flag';
import '../country-flag';
import {Deck} from '../../classes/deck';

@customElement('deck-title')
export class DeckTitle extends LitElement {
  static get styles() {
    return css`
      .title-row {
        display: flex;
        flex-direction: row;
        align-items: center;
        flex-wrap: wrap;
      }

      .title-row > * {
        font-size: 16px;
      }

      .title {
        display: flex;
        flex-direction: row;
        align-items: center;
        column-gap: var(--lumo-space-m);
        row-gap: var(--lumo-space-xs);
        width: 100%;
        flex-wrap: wrap;
      }

      .flags {
        display: flex;
        flex-direction: row;
        gap: var(--lumo-space-s);
        align-items: center;
      }

      .flags > * {
        height: 60px;
      }

      h2 {
        margin: 0;
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
      <div class="title">
        <div class="flags">
          <division-flag .division=${this.deck.division}></division-flag
          ><country-flag .country=${this.deck.division.country}></country-flag>
        </div>
        <div style="display: flex;">
          <slot name="title" style="flex: 1 1 100%; ">
            <h2>${this.name}</h2>
          </slot>
        </div>
        <div></div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'deck-title': DeckTitle;
  }
}
