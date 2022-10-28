import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement} from 'lit/decorators.js';

@customElement('filter-chip')
export class FilterChip extends LitElement {
  static get styles() {
    return css`
      :host {
        --background: var(--lumo-contrast-5pct);
        --color: var(--lumo-primary-text-color);;
        border-radius: 16px;
        margin: 4px;
        padding: 7px 12px;
        display: inline-flex;
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
      }
    `;
  }

  render(): TemplateResult {
    return html`<slot></slot>`;
  }
}
