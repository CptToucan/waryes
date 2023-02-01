import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {Deck} from '../../classes/deck';
import './armoury-view';
import './deck-view';
import 'side-drawer';

@customElement('edit-deck')
export class EditDeck extends LitElement {
  static get styles() {
    return css`
      .filters {
        grid-area: filters;
        border-left: 1px solid var(--lumo-contrast-10pct);
        padding: var(--lumo-space-s);
      }



      h3 {
        margin: 0;
      }



      .deck-category-heading-title {
        color: var(--lumo-primary-color-50pct);
        text-transform: uppercase;
      }

      side-drawer {
        background-color: var(--lumo-base-color);
        max-width: 95vw;
      }

      side-drawer > .deck {
        height: 100%;
        overflow: auto;
      }

      :host {
        display: flex;
        flex: 0 0 100%;
        height: 100%;
      }
      .container {
        flex: 1 1 0;
        max-height: 100%;
        padding-top: var(--lumo-space-s);
        padding-bottom: var(--lumo-space-s);

        overflow: hidden;
      }

      .cards {
        height: 100%;
        overflow: auto;
        position: relative;
      }

      .deck {
        padding-left: var(--lumo-space-s);
        padding-right: var(--lumo-space-s);
      }

      .desktop {
        display: flex;
        flex-direction: row;
        height: 100%;
      }

      .desktop > .cards {
        flex: 1 1 80%;
      }

      .desktop > deck-view {
        flex: 1 0 20%;
        height: 100%;
        overflow-y: auto;
        min-width: 300px;
        border-right: 1px solid var(--lumo-contrast-20pct);
      }

      .button-drawer {
        position: fixed;
        bottom: 0;
        height: 60px;
        width: 100%;
        background-color: var(--lumo-base-color);
        z-index: 1;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-top: 1px solid var(--lumo-contrast-20pct);
      }

      .button-drawer > vaadin-button {
        flex: 1 1 100%;
        margin-left: var(--lumo-space-s);
        margin-right: var(--lumo-space-s);
      }

      @media only screen and (min-width: 701px) {
        .button-drawer {
          display: none;
        }
      }

      @media only screen and (max-width: 700px) {
        .desktop > .deck {
          display: none;
        }
      }
    `;
  }

  @property()
  deck?: Deck;

  @state()
  deckOpen = false;

  render(): TemplateResult {
    return html`
      <div class="container">
        <side-drawer
          .open=${this.deckOpen}
          @close=${() => (this.deckOpen = false)}
          @open=${() => (this.deckOpen = true)}
        >
          <deck-view .deck=${this.deck}></deck-view>
        </side-drawer>
        <div class="desktop">
          <deck-view .deck=${this.deck}></deck-view>

          <div class="cards">
            <div class="button-drawer">
              <vaadin-button
                @click=${() => (this.deckOpen = !this.deckOpen)}
                theme="large"
                >Deck</vaadin-button
              >
              <vaadin-button
                @click=${() => (this.deckOpen = !this.deckOpen)}
                theme="large"
                >Filters</vaadin-button
              >
            </div>

            <armoury-view .deck=${this.deck}></armoury-view>

            <div style="height: 60px;"></div>
          </div>
        </div>
      </div>
    `;
  }
}
