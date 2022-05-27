import {IonModal} from '@ionic/core/components/ion-modal';
import {IonSelect} from '@ionic/core/components/ion-select';
import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property, query, state} from 'lit/decorators.js';
import {WarnoUnit, WarnoWeapon} from '../types';

import {
  platoonStats,
  weaponStats,
  staticStats,
  extractUnitInformation,
} from '../utils/extract-unit-information';
import {humanize} from '../utils/humanize';

type UnitWeaponCouplet = {
  unit: WarnoUnit;
  weapons: WarnoWeapon[];
};

@customElement('selected-units-modal')
export class Unit extends LitElement {
  @property()
  parentModal?: IonModal;

  @property()
  selectedUnits: WarnoUnit[] = [];

  @state()
  selectedUnitFields: string[] = [];

  @state()
  selectedWeaponFields: string[] = [];

  @state()
  _canCompare = false;

  @state()
  _canSelectedWeaponFields = false;

  @state()
  _chartOptions: any;

  @query('#static-fields')
  staticFieldSelect!: IonSelect;

  @query('#echarts')
  echartsElement!: HTMLDivElement;

  static get styles() {
    return css`
      ion-toolbar {
        --background: var(--ion-panel-background-color);
        --color: var(--ion-color-secondary);
      }

      :host {
        --color: var(--ion-color-light);
      }

      ion-button.filter-button {
        --background: var(--ion-color-primary) !important;
      }

      ion-item {
        --color: white;
      }

      ion-accordion {
        color: white !important;
        --color: white !important;
      }

      ion-accordion {
        --ion-text-color-rgb: var(--ion-color-light-rgb) !important;
      }

      .button-container {
        display: flex;
        justify-content: end;
        flex: 1 1 100%;
        padding-left: 8px;
        padding-right: 8px;
      }

      .error-message {
        color: var(--ion-color-danger);
        padding-left: 8px;
        padding-right: 8px;
        text-align: center;
      }
    `;
  }

  dismissModal() {
    this.parentModal?.dismiss();
  }

  selectedUnitFieldsUpdated(event: {detail: {value: string[]}}) {
    this.selectedUnitFields = event.detail.value;
  }

  selectedWeaponFieldsUpdated(event: {detail: {value: string[]}}) {
    this.selectedWeaponFields = event.detail.value;
  }

  compareFields() {
    const indicators = [];
    const seriesData = [];
    const legend: string[] = [];

    for (const field of this.selectedUnitFields) {
      indicators.push({name: field});
    }

    for (const unit of this.selectedUnits) {
      const values = [];

      for (const field of this.selectedUnitFields) {
        values.push(unit[field]);
      }
      seriesData.push({
        name: unit.name,
        value: values,
      });
      legend.push(unit.name);
    }

    this._chartOptions = {
      legend: {
        data: legend,
      },
      textStyle: {
        fontFamily: 'Orbitron',
      },
      radar: {
        indicator: indicators,
        shape: 'circle',
        splitLine: {
          lineStyle: {
            color: [
              'rgba(255, 31, 236, 0.1)',
              'rgba(255, 31, 236, 0.2)',
              'rgba(255, 31, 236, 0.4)',
              'rgba(255, 31, 236, 0.6)',
              'rgba(255, 31, 236, 0.8)',
              'rgba(255, 31, 236, 1)',
            ].reverse(),
          },
        },
        splitArea: false,
      },
      series: [
        {
          type: 'radar',
          data: seriesData,
          symbolSize: 16,
        },
      ],
    };
  }

  renderUnitWithWeaponsSelect(unitWeapon: UnitWeaponCouplet): TemplateResult {
    return html`<ion-list-header> ${unitWeapon.unit.name} </ion-list-header>
      <ion-item>
        <ion-label>Selected Weapon</ion-label>
        <ion-select
          id="static-fields"
          class="select-override"
          cancel-text="Cancel"
          ok-text="Confirm"
        >
          ${unitWeapon.weapons.map(
            (el) =>
              html`<ion-select-option value=${el.type}>
                ${el.type}</ion-select-option
              >`
          )}
          <ion-select-option> NONE</ion-select-option>
        </ion-select>
      </ion-item> `;
  }

  renderUnitFieldsSelect(): TemplateResult {
    return html`<ion-label>Unit Fields</ion-label>
      <ion-select
        id="static-fields"
        class="select-override"
        multiple="true"
        cancel-text="Cancel"
        ok-text="Confirm"
        @ionChange=${this.selectedUnitFieldsUpdated}
      >
        ${[...staticStats, ...platoonStats].map(
          (el) =>
            html`<ion-select-option value=${el}
              >${humanize(el)}</ion-select-option
            >`
        )}
      </ion-select>`;
  }

  renderWeaponFieldsSelect(): TemplateResult {
    return html`<ion-label>Weapon Fields</ion-label>
      <ion-select
        class="select-override"
        ?multiple=${true}
        cancel-text="Cancel"
        ok-text="Confirm"
        @ionChange=${this.selectedWeaponFieldsUpdated}
      >
        ${weaponStats
          .filter((el) => el !== 'type' && el !== 'name')
          .map(
            (el) =>
              html`<ion-select-option value=${el}
                >${humanize(el)}</ion-select-option
              >`
          )}
      </ion-select>`;
  }

  renderUnitsFieldSelectors(): TemplateResult {
    const unitWeaponsList: UnitWeaponCouplet[] = [];

    for (const selectedUnit of this.selectedUnits) {
      const unitInfo = extractUnitInformation(selectedUnit);
      const unitWeapons = unitInfo.allWeaponsInformation.filter(
        (selectedWeapon) => selectedWeapon.name !== undefined
      );
      unitWeaponsList.push({unit: selectedUnit, weapons: unitWeapons});
    }

    return html`
      <ion-accordion-group>
        <ion-accordion value="units">
          <ion-item slot="header">
            <ion-label>Select Weapons</ion-label>
          </ion-item>
          <ion-list slot="content">
            ${unitWeaponsList.map(
              (unit) => html`${this.renderUnitWithWeaponsSelect(unit)}`
            )}
          </ion-list>
        </ion-accordion>
      </ion-accordion-group>

      <ion-list>
        <ion-list-header>
          <ion-label> Field Selection </ion-label>
        </ion-list-header>
        <ion-item>${this.renderUnitFieldsSelect()}</ion-item>
        <ion-item>${this.renderWeaponFieldsSelect()}</ion-item>
      </ion-list>
      <div class="button-container">
        <ion-button
          class="filter-button"
          @click=${this.compareFields}
          ?disabled=${!this._canCompare}
        >
          Compare
        </ion-button>
      </div>
    `;
  }

  renderErrorMessage(errorMessage: string): TemplateResult {
    return html` <div class="error-message">
    </div>`;
  }

  render() {
    return html`<ion-header>
        <ion-toolbar>
          <ion-title><ion-text color="secondary">Compare</ion-text></ion-title>
          <ion-buttons slot="primary">
            <ion-button @click=${this.dismissModal}>
              <ion-icon slot="icon-only" name="close"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        ${this.renderUnitsFieldSelectors()}
        ${this.renderErrorMessage("You can't compare weapon fields when you have not selected any weapons")};

        ${this._chartOptions
          ? html`<e-chart .options=${this._chartOptions}></e-chart>`
          : html``}
      </ion-content>`;
  }

  willUpdate(changedProperties) {
    console.log(this.selectedUnitFields, this.selectedWeaponFields);
    if (
      changedProperties.has('selectedUnitFields') ||
      changedProperties.has('selectedWeaponFields')
    ) {
      if (
        this.selectedUnitFields.length > 0 ||
        this.selectedWeaponFields.length > 0
      ) {
        this._canCompare = true;
      } else {
        this._canCompare = false;
      }
    }
  }
}
