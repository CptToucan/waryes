import {
  LitElement,
  html,
  css,
  customElement,
  property,
} from 'lit-element';
import './progress-bar';


@customElement('division-trait')
export class DivisionTrait extends LitElement {
  static get styles() {
    return css`
     
    `;
  }

  @property()
  traitTitle = '';

  @property()
  analysis = 0;

  
  render() {
    return html`${this.traitTitle}`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'division-trait': DivisionTrait;
  }
}
