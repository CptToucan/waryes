import {css, html, LitElement} from 'lit';
import {customElement, query} from 'lit/decorators.js';
import {WarnoUnit} from '../types';
import {UnitService} from '../services/unit';
import {TabulatorFull as Tabulator} from 'tabulator-tables';
import {humanize} from '../utils/humanize';
import {IonModal} from '@ionic/core/components/ion-modal';
import {modalController} from '@ionic/core';

import { platoonStats, staticStats } from '../utils/extract-unit-information';

@customElement('units-list-route')
export class UnitsListRoute extends LitElement {
  static get styles() {
    return css``;
  }

  @query('ion-modal')
  modal!: IonModal;

  table?: Tabulator;

  protected createRenderRoot() {
    return this;
  }

  async firstUpdated() {
    const units: WarnoUnit[] = UnitService.units;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const columns: any[] = [
      {
        field: "id",
        title: "Name",
        formatter: "link", formatterParams: {
          labelField: "name",
          urlPrefix: "/#/unit/"
        }
      }
    ];

    for (const columnName of [...platoonStats, ...staticStats]) {
      if(columnName !== "name") {
        columns.push({title: humanize(columnName), field: columnName});
      }
    }

    this.table = new Tabulator('#units-table', {
      height: '700px',
      data: units,
      columns,
      selectable: true,
    });
  }

  async openSelected() {
    const modal = await modalController.create({
      component: 'selected-units-modal',
      componentProps: {
        selectedUnits: this.table?.getSelectedData(),
      }
    });


    modal.componentProps = {
      ...modal.componentProps,
      parentModal: modal
    };
    modal.present();
  }

  render() {
    return html`
      <ion-modal>
        <ion-content>
          <ion-text color="secondary">
            <h1>Selected Units</h1>
          </ion-text>
        </ion-content>
      </ion-modal>
      <ion-content>
        <ion-grid>
          <ion-row class="ion-justify-content-start">
            <ion-col>
              <ion-text color="secondary">
                <h1 style="font-weight: bold">Units</h1>
              </ion-text>
            </ion-col>
          </ion-row>
          <ion-row>
            <div id="units-table"></div>
          </ion-row>
        </ion-grid>
        <ion-fab vertical="bottom" horizontal="end" slot="fixed">
          <ion-fab-button @click=${this.openSelected}>
            <ion-icon name="checkmark-outline"></ion-icon>
          </ion-fab-button>
        </ion-fab>
      </ion-content>
    `;
  }
}
