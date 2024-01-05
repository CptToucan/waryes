import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement} from 'lit/decorators.js';

@customElement('simple-chip')
export class SimpleChip extends LitElement {
  static get styles() {
    return css`
      :host {
        --background: var(--lumo-primary-color-10pct);
        --color: var(--lumo-primary-text-color);
        border-radius: var(--lumo-border-radius-m);
        padding: 7px 6px;
        display: inline-flex;
        justify-content: center;
        position: relative;
        align-items: center;
        height: 32px;
        background: var(--background);
        color: var(--color);
        font-size: 14px;
        line-height: 1;
        cursor: pointer;
        overflow: hidden;
        vertical-align: middle;
        box-sizing: border-box;
        white-space: nowrap;
        text-align: center;
      }
    `;
  }

  render(): TemplateResult {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'simple-chip': SimpleChip;
  }
}