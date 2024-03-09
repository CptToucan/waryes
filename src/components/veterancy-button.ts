import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement} from 'lit/decorators.js';

@customElement('veterancy-button')
export class VeterancyButton extends LitElement {
  static get styles() {
    return css`
    
    `;
  }

  render(): TemplateResult {
    return html`
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'veterancy-button': VeterancyButton;
  }
}