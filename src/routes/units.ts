import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement} from 'lit/decorators.js';
// @ts-ignore
import WaryesImage from '../../images/waryes-transparent.png';
import '../components/units-table';

@customElement('units-route')
export class UnitsRoute extends LitElement {
  static get styles() {
    return css`
      :host {
        display: flex;
        flex-direction: column;
        height: 100%;
      }
    `;
  }

  render(): TemplateResult {
    return html`
      <units-table></units-table>
    `;
  }
}
