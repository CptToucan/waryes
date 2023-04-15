import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property} from 'lit/decorators.js';



@customElement('unit-trait')
export class UnitTrait extends LitElement {
  static get styles() {
    return css`
      :host {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
      }

      img {
        width: 100%
      }
    `;
  }

  @property()
  trait?: string;
  
  render(): TemplateResult {
   
    return html`<vaadin-icon></vaadin-icon>`;
  }
}


declare global {
  interface HTMLElementTagNameMap {
    'unit-trait': UnitTrait;
  }
}