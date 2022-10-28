import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement} from 'lit/decorators.js';
// @ts-ignore
import WaryesImage from '../../images/waryes-transparent.png';
import '@vaadin/multi-select-combo-box';
import '@vaadin/combo-box';
import { UnitsDatabaseService } from "../services/units-db";
import { Unit } from '../types/unit';
import { ComboBoxSelectedItemChangedEvent } from '@vaadin/combo-box';
import { Router } from '@vaadin/router';

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

      vaadin-combo-box {
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

  units?: Unit[] = [];

  async firstUpdated() {
    const units = await UnitsDatabaseService.fetchUnits();

    if(units !== null) {
      const sortedUnits = units.filter(unit => unit.name !== "").sort((a,b) => {
        if(a.name < b.name) {
          return -1;
        }
        if(a.name > b.name) {
          return 1;
        }
        return 0;
      });

      this.units = sortedUnits
      this.requestUpdate();
    }
  }

  unitSelected(event: ComboBoxSelectedItemChangedEvent<Unit>)  {
    if(event.detail.value) {
      Router.go(`/unit/${event.detail.value?.descriptorName}`);
    }
    
  }

  render(): TemplateResult {
    return html`
      <div class="splash">
        <img height="86" src=${WaryesImage} />
        <div class="search">
          <vaadin-combo-box
            placeholder="Search for Warno unit"
            .items=${this.units}
            item-label-path="name"
            @selected-item-changed=${this.unitSelected}
          ></vaadin-combo-box>
        </div>
        <div class="or">OR</div>
        <div>
          <vaadin-button @click=${() => {Router.go("/units/")}} theme="large">View All</vaadin-button>
        </div>
      </div>
    `;
  }
}
