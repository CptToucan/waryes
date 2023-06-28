import {css, html, LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';

@customElement('content-panel')
export class ContentPanel extends LitElement {
  static get styles() {
    return css`
      :host {
        display: flex;
        flex-direction: column;
        justify-content: center;
        background-color: var(--lumo-contrast-5pct);
        border-radius: var(--lumo-border-radius);
        padding: var(--lumo-space-s);
      }
    `;
  }

  render() {
    return html` <slot></slot> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'content-panel': ContentPanel;
  }
}
