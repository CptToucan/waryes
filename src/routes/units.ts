import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement} from 'lit/decorators.js';
// @ts-ignore
import WaryesImage from '../../images/waryes-transparent.png';
import '../components/units-table';

@customElement('units-route')
export class UnitsRoute extends LitElement {
  static get styles() {
    return css``;
  }

  render(): TemplateResult {
    return html`
    <div>
      <div style="width: 100%; display: flex; justify-content: center">
        <img height="86" src=${WaryesImage} />
      </div>
      <p style='text-align:center;'>Units</p>
      <units-table></units-table>
    </div>
    `;
  }
}
