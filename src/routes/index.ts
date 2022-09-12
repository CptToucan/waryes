import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement} from 'lit/decorators.js';
// @ts-ignore
import WaryesImage from '../../images/waryes-transparent.png';

@customElement('index-route')
export class IndexRoute extends LitElement {
  static get styles() {
    return css``;
  }

  protected createRenderRoot() {
    return this;
  }

  render(): TemplateResult {
    return html`
      <div style="width: 100%; display: flex; justify-content: center">
        <img height="86" src=${WaryesImage} />
      </div>
    `;
  }
}
