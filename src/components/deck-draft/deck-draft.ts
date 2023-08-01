import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement} from 'lit/decorators.js';

@customElement('deck-draft')
export class DeckDraft extends LitElement {
  static get styles() {
    return css`
      :host {

      }
    `;
  }

  render(): TemplateResult {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'deck-draft': DeckDraft;
  }
}
