import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement} from 'lit/decorators.js';
import '@vaadin/icon';

@customElement('deck-card')
export class DeckCard extends LitElement {
  static get styles() {
    return css`
      :host {
        background-color: var(--lumo-contrast-5pct);
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        border-radius: var(--lumo-border-radius-m);
        padding-left: var(--lumo-space-s);
        padding-right: var(--lumo-space-s);
        padding-top: var(--lumo-space-s);
        padding-bottom: var(--lumo-space-s);
        overflow: hidden;
        height: 32px;
        cursor: pointer;
      }

      .start-section, .end-section {
        display: flex;
        flex-direction: row;
        align-items: center;
      }

      :host(:hover) {
        background-color: var(--lumo-contrast-10pct);
      }

      vaadin-icon {
        margin: var(--lumo-space-s);
        font-size: 16px;
      }

      .points {
        padding-left: var(--lumo-space-s);
        padding-right: var(--lumo-space-s);
        color: var(--lumo-primary-color);
      }

      .name {
        padding-left: var(--lumo-space-s);
        padding-right: var(--lumo-space-s);
      }

      .quantity {
        color: white;
      }
    `;
  }

  render(): TemplateResult {
    return html`
      <div class="start-section">
        <vaadin-icon icon="vaadin:airplane"></vaadin-icon>
        <div class="points">90</div>
        <div class="name">Harrier</div>
      </div>
      <div class="end-section">
        <div class="quantity">
          x2
        </div>

      </div>
    `;
  }
}
