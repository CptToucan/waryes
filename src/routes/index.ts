import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement} from 'lit/decorators.js';
// @ts-ignore
import WaryesImage from '../../images/waryes-transparent.png';
import '@vaadin/multi-select-combo-box';
import '@vaadin/combo-box';
import { Unit } from '../types/unit';
import { Router } from '@vaadin/router';
import "../components/unit-search";

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

      unit-search {
        flex: 1 1 0;
      }


      .or {
        font-size: var(--lumo-font-size-l);   
        padding-top: var(--lumo-space-m);
        padding-bottom: var(--lumo-space-m);
      }
    `;
  }

  unitSelected(event: CustomEvent)  {
    if(event.detail.value as Unit) {
      Router.go(`/unit/${event.detail.value?.descriptorName}`);
    }
  }


  render(): TemplateResult {
    return html`
      <div class="splash">
        <img height="86" src=${WaryesImage} />
        <div class="search">
          <unit-search @unit-selected=${this.unitSelected}></unit-search>
        </div>
        <div class="or">OR</div>
        <div>
          <vaadin-button @click=${() => {Router.go("/units/")}} theme="large">View All</vaadin-button>
        </div>
      </div>
    `;
  }
}
