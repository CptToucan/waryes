import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement} from 'lit/decorators.js';

@customElement('trait-badge')
export class Badge extends LitElement {
  static get styles() {
    return css`
      :host {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        padding: 0.4em calc(0.5em + var(--lumo-border-radius-s) / 4);
        color: var(--lumo-primary-text-color);
        background-color: var(--lumo-primary-color-10pct);
        border-radius: var(--lumo-border-radius-s);
        font-family: var(--lumo-font-family);
        font-size: var(--lumo-font-size-s);
        line-height: 1;
        font-weight: 500;
        text-transform: initial;
        letter-spacing: initial;
        min-width: calc(var(--lumo-line-height-xs) * 1em + 0.45em);
      }
    `;
  }

  render(): TemplateResult {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'trait-badge': Badge;
  }
}
