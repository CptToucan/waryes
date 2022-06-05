import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement} from 'lit/decorators.js';
// @ts-ignore
import WaryesImage from "../../images/waryes-transparent.png";

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
      <ion-content>
        <ion-grid>
          <ion-row class="ion-justify-content-center">
            <ion-col>
              <div style="width: 100%; display: flex; justify-content: center">
                <img height="86" src=${WaryesImage} />
              </div>
            </ion-col>
          </ion-row>
          <ion-row class="ion-justify-content-center">
            <ion-col size="8">
                <search-results></search-results>
            </ion-col>
          </ion-row>
        </ion-grid>
      </ion-content>
    `;
  }
}
