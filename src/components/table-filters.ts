import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {UnitService} from '../services/unit';
import {fieldType, metadataStore, operator} from '../types';
import {SelectCustomEvent} from '@ionic/core';
import {FilterMetadata} from '../metadata/FilterMetadata';
import {animate, fade} from '@lit-labs/motion';

@customElement('table-filters')
export class TableFilters extends LitElement {
  static get styles() {
    return css`
      .filter-row {
        display: flex;
        flex-direction: row;
        padding-top: 4px;
        padding-bottom: 4px;
      }

      .v-hidden {
        height: 0px;
        opacity: 0;
        display: none !important;
      }

      .v-display {
        height: 70px;
        opacity: 1;
      }

      .filter-selection {
        display: flex;
        justify-content: flex-end !important;
      }


      @media screen and (max-width: 600px) {
        .filter-row {
          flex-wrap: wrap;
        }
        .filter-row > div {
          flex: 1 0 50%;
        }

        .v-display {
        height: 100px;
        opacity: 1;
      }

      }

      .filter-row > div {
        flex: 1 1 25%;
        margin-left: 8px;
        margin-right: 8px;
        display: flex;
        flex-direction: column;
        align-items: stretch;
        justify-content: center;
        overflow: hidden;
        flex-wrap: wrap;
      }

      .filter-row > div > * {
        max-width: 100%;
      }

      .button-container {
        display: flex;
        justify-content: flex-end !important;
      }

      ion-input,
      ion-select {
        --background: var(--ion-panel-background-color) !important;
        --color: white !important;
        --placeholder-color: white !important;
      }

      ion-select {
        background: var(--ion-panel-background-color) !important;
      }
    `;
  }

  @property({type: Boolean})
  showFilterSelection = false;

  activeFilter?: FilterMetadata<unknown>;

  filters: FilterMetadata<unknown>[] = [];

  didSelectField(event: SelectCustomEvent<string>) {
    const fieldMetadata =
      UnitService.metadata[event.detail.value as keyof metadataStore];
    this.activeFilter = new FilterMetadata(fieldMetadata);
    this.requestUpdate();
  }

  didSelectOperator(event: SelectCustomEvent<operator>) {
    if (this.activeFilter) {
      this.activeFilter.operator = event.detail.value;
      this.requestUpdate();
    }
  }

  addActiveFilterToFilters() {
    if (this.activeFilter) {
      this.filters.push(this.activeFilter);
    }

    this.activeFilter = undefined;
    this.dispatchEvent(
      new CustomEvent('filters-changed', {detail: {value: this.filters}})
    );
    this.requestUpdate();
  }

  removeFilterFromFilters(filter: FilterMetadata<unknown>) {
    this.filters = this.filters.filter((el) => el !== filter);
    this.dispatchEvent(
      new CustomEvent('filters-changed', {detail: {value: this.filters}})
    );
    this.requestUpdate();
  }

  renderFieldSelect() {
    return html`
      <ion-label>Field</ion-label>
      <ion-select @ionChange=${this.didSelectField}>
        ${[
          ...UnitService.findFieldMetadataByType(fieldType.STATIC),
          ...UnitService.findFieldMetadataByType(fieldType.PLATOON),
        ].map(
          (field) =>
            html`<ion-select-option value=${field.id}
              >${field.label}</ion-select-option
            >`
        )}
      </ion-select>
    `;
  }

  renderOperatorSelect() {
    if (this.activeFilter?.field) {
      return html`
        <ion-label>Operator</ion-label>
        <ion-select
          @ionChange=${this.didSelectOperator}
          .value=${this.activeFilter.operator}
        >
          ${this.activeFilter.availableOperators.map(
            (el) =>
              html`<ion-select-option value=${el}>${el}</ion-select-option>`
          )}
        </ion-select>
      `;
    }
    return html``;
  }

  renderValueEntry() {
    if (this.activeFilter?.field && this.activeFilter?.operator) {
      let componentHtml: TemplateResult = html``;
      const fieldType = this.activeFilter.field.type;

      if (fieldType === 'boolean') {
        componentHtml = html`<filter-boolean-value
          .filter=${this.activeFilter}
          @value-changed=${() => this.requestUpdate()}
        ></filter-boolean-value>`;
      } else if (fieldType === 'enum') {
        componentHtml = html`<filter-enum-value
          .filter=${this.activeFilter}
          @value-changed=${() => this.requestUpdate()}
        ></filter-enum-value>`;
      } else if (fieldType === 'number') {
        if (
          this.activeFilter.operator === operator.EQUALS ||
          this.activeFilter.operator === operator.GREATER_THAN ||
          this.activeFilter.operator === operator.LESS_THAN
        ) {
          componentHtml = html`<filter-number-value
            .filter=${this.activeFilter}
            @value-changed=${() => {
              this.requestUpdate();
            }}
          ></filter-number-value>`;
        } else if (this.activeFilter.operator === operator.RANGE) {
          componentHtml = html`<filter-range-value></filter-range-value>`;
        }
      } else {
        componentHtml = html`<filter-string-value
          .filter=${this.activeFilter}
          @value-changed=${() => {
            this.requestUpdate();
          }}
        ></filter-string-value>`;
      }
      return html`<ion-label>Value</ion-label>${componentHtml}`;
    }
    return html``;
  }

  renderFilterSelection() {
    return html`<div
      class="filter-row ${this.showFilterSelection ? 'v-display' : 'v-hidden'}"
      ${animate({in: fade, out: fade})}
    >
      <div class="filter-selection">${this.renderFieldSelect()}</div>
      <div class="filter-selection">${this.renderOperatorSelect()}</div>
      <div class="filter-selection">${this.renderValueEntry()}</div>
      <div class="button-container">
        <ion-label></ion-label>
        <ion-button
          @click=${this.addActiveFilterToFilters}
          ?disabled=${this.activeFilter?.field &&
          this.activeFilter?.operator &&
          this.activeFilter?.value
            ? false
            : true}
          ><ion-icon name="add-outline" slot="icon-only"></ion-icon
        ></ion-button>
      </div>
    </div>`;
  }

  render() {
    return html` <div
      style="display: flex; flex-direction: column;"
    >
      ${this.renderFilterSelection()}
      <div style="max-height: 32px;">
        ${this.filters.map((filter) => {
          let value: string;

          if (Array.isArray(filter.value)) {
            value = filter.value.join(', ');
          } else {
            value = filter.value as string;
          }
          return html`<ion-chip
            style="--background: var(--ion-text-color); max-height: 32px;"
            @click=${() => {
              this.removeFilterFromFilters(filter);
            }}
            ><ion-label
              >${filter.field.label} - ${filter.operator} - ${value}</ion-label
            >
            <ion-icon name="close-circle"></ion-icon
          ></ion-chip>`;
        })}
      </div>
    </div>`;
  }
}
