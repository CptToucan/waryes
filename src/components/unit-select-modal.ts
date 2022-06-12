import {CheckboxCustomEvent, SearchbarCustomEvent} from '@ionic/core';
import {IonModal} from '@ionic/core/components/ion-modal';
import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {repeat} from 'lit/directives/repeat.js';
import {UnitService} from '../services/unit';
import {modalController} from '@ionic/core';
import {UnitMetadata} from '../types';

@customElement('unit-select-modal')
export class UnitSelectModal extends LitElement {
  static get styles() {
    return css`
      ion-input,
      ion-searchbar {
        --background: var(--ion-panel-background-color) !important;
        --color: white !important;
        --placeholder-color: white !important;
      }

      ion-input > input {
        border: 1px solid white !important;
        border-radius: 5px !important;
      }
    `;
  }

  @state()
  searchTerm = '';

  @state()
  selectedUnitIds: string[] = [];

  @property()
  parentModal?: IonModal;

  dismissModal() {
    this.parentModal?.dismiss();
  }

  setSearchTerm(event: SearchbarCustomEvent) {
    this.searchTerm = event.detail.value || '';
  }

  selectUnit(event: CheckboxCustomEvent) {
    if (event.detail.checked) {
      this.selectedUnitIds = [...this.selectedUnitIds, event.detail.value];
    } else {
      this.selectedUnitIds = this.selectedUnitIds.filter(
        (id) => id !== event.detail.value
      );
    }
  }

  navigateToCompare() {
    const selectedUnits = UnitService.getUnitsById(this.selectedUnitIds);
    this.openSelected(selectedUnits);
  }

  async openSelected(selectedUnits: UnitMetadata[]) {
    const modal = await modalController.create({
      component: 'selected-units-modal',
      componentProps: {
        selectedUnits: selectedUnits,
      },
    });

    modal.componentProps = {
      ...modal.componentProps,
      parentModal: modal,
    };
    modal.present();
  }

  render(): TemplateResult {
    const units = UnitService.units;

    return html`<ion-header>
        <ion-toolbar>
          <ion-title
            ><ion-text color="secondary">Select Units</ion-text></ion-title
          >
          <ion-buttons slot="primary">
            <ion-button @click=${this.dismissModal}>
              <ion-icon slot="icon-only" name="close"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
        <ion-toolbar>
          <ion-searchbar @ionChange=${this.setSearchTerm}></ion-searchbar
        ></ion-toolbar>
      </ion-header>
      <ion-content class="content-padding">
        <ion-list>
          ${repeat(
            units.filter((unit) => {
              return unit.name
                .toLowerCase()
                .includes(this.searchTerm.toLowerCase());
            }),
            (unit) => unit.id,
            (unit) => {
              return html`<ion-item @ionChange=${this.selectUnit}>
                <ion-label>${unit.name}</ion-label>
                <ion-checkbox
                  slot="start"
                  value=${unit.id}
                  ?checked=${this.selectedUnitIds.includes(unit.id)}
                >
                </ion-checkbox>
              </ion-item>`;
            }
          )}
        </ion-list>

        <ion-fab vertical="bottom" horizontal="end" slot="fixed">
          <ion-fab-button
            ?disabled=${this.selectedUnitIds.length === 0}
            @click=${this.navigateToCompare}
          >
            <ion-icon name="checkmark-outline"></ion-icon>
          </ion-fab-button>
        </ion-fab>
      </ion-content>`;
  }
}
