import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement} from 'lit/decorators.js';
// @ts-ignore
import WaryesImage from '../../images/waryes-transparent.png';
import '@vaadin/multi-select-combo-box';
import {
  ComboBoxDataProviderCallback,
  ComboBoxDataProviderParams,
} from '@vaadin/combo-box/src/vaadin-combo-box';

type Unit = {
  id: string;
};

@customElement('index-route')
export class IndexRoute extends LitElement {
  static get styles() {
    return css`
      .splash {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      }

      .search {
        padding-top: var(--lumo-space-xl);
        align-self: stretch;
        display: flex;
        justify-content: center;
        align-items: center;
        padding-left: var(--lumo-space-xl);
        padding-right: var(--lumo-space-xl);
      }

      vaadin-multi-select-combo-box {
        font-size: var(--lumo-font-size-l);
        flex: 1 1 0;
        max-width: 512px;
      }

      .or {
        font-size: var(--lumo-font-size-l);   
        padding-top: var(--lumo-space-m);
        padding-bottom: var(--lumo-space-m);
      }
    `;
  }

  dataProvider(
    params: ComboBoxDataProviderParams,
    callback: ComboBoxDataProviderCallback<Unit>
  ) {
    console.log(params, callback);
  }

  render(): TemplateResult {
    return html`
      <div class="splash">
        <img height="86" src=${WaryesImage} />
        <div class="search">
          <vaadin-multi-select-combo-box
            placeholder="Search for Warno unit"
            .dataProvider=${this.dataProvider}
          ></vaadin-multi-select-combo-box>
        </div>
        <div class="or">OR</div>
        <div>
          <vaadin-button theme="large">View All</vaadin-button>
        </div>
      </div>
    `;
  }
}
