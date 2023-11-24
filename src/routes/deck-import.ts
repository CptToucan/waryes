import { TextAreaValueChangedEvent } from '@vaadin/text-area';
import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement} from 'lit/decorators.js';
import { viewDeckCode } from '../utils/view-deck-code';
import '@vaadin/text-area';

@customElement('deck-import-route')
export class DeckImportRoute extends LitElement {
  static get styles() {
    return css`
      .container {
        padding-left: var(--lumo-space-s);
        padding-right: var(--lumo-space-s);
        display: flex;
      }
      .division-import {
        display: flex;
        flex-direction: column;
        width: 100%;
      }

      vaadin-text-area {
        min-height: 100px;
      }

      .button-row {
        display: flex;
        justify-content: flex-end;
      }
      span {
        color: var(--lumo-contrast);
      }

    `;
  }

  deckCode?: string;

  importDeck() {
    if(this.deckCode) {
      return viewDeckCode(this.deckCode);
    }
    throw new Error("No deck code");
  }

  render(): TemplateResult {
    return html` <div class="container">
      <div class="division-import">
        <h1>Import a deck</h1>
        <div
          >Paste your deck code in to the text area below, and press import. You
          will then be taken to view and edit the deck.</div>
        <vaadin-text-area label="Deck Code" clear-button-visible @value-changed=${(event: TextAreaValueChangedEvent) => this.deckCode = event.detail.value}>
          <vaadin-icon slot="prefix" icon="vaadin:code"></vaadin-icon>
        </vaadin-text-area>
        <div class="button-row"><vaadin-button theme="primary large" @click=${this.importDeck}>Import</vaadin-button></div>
      </div>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'deck-import-route': DeckImportRoute;
  }
}
