import {ComboBox, ComboBoxSelectedItemChangedEvent} from '@vaadin/combo-box';
import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property, query, state} from 'lit/decorators.js';
import {AbstractFieldMetadata} from '../types/AbstractFieldMetadata';
import {FilterOperator} from '../types/filter';
import {FilterMetadata} from '../types/FilterMetadata';
import '../components/filter/boolean-value';
import '../components/filter/string-value';
import '../components/filter/number-value';

@customElement('filters-builder')
export class FiltersBuilder extends LitElement {
  static get styles() {
    return css`
      .filter-builder {
        display: flex;
        flex-wrap: wrap;
      }

      .filter-builder > div {
        padding-left: var(--lumo-space-xs);
        padding-right: var(--lumo-space-xs);
        flex: 1 0 0;
        display: flex;
      }

      .filter-builder > div > * {
        flex: 1 1 0;
      }

      .filter-button-container {
        display: flex;
        align-items: flex-end;
      }

      filter-number-value, filter-string-value, filter-boolean-value {
        flex: 1 1 0;
      }
    `;
  }

  @state()
  activeFilter?: FilterMetadata<unknown>;
  filters: FilterMetadata<unknown>[] = [];

  @property()
  availableFields: AbstractFieldMetadata<unknown>[] = [];

  @query("#field-select")
  fieldSelectElement?: ComboBox;

  @query("#operator-select")
  operatorSelectElement?: ComboBox;


  filterFieldSelected(
    event: ComboBoxSelectedItemChangedEvent<AbstractFieldMetadata<unknown>>
  ) {
    if (event.detail.value) {
      const fieldMetadata = event.detail.value;
      this.activeFilter = new FilterMetadata(fieldMetadata);
      this.requestUpdate();
    }
  }

  filterOperatorSelected(
    event: ComboBoxSelectedItemChangedEvent<FilterOperator>
  ) {
    if (this.activeFilter) {
      this.activeFilter.operator = event.detail.value || undefined;
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
      <vaadin-combo-box
        id="field-select"
        label="Field"
        .items=${this.availableFields}
        item-label-path="label"
        item-value-path="name"
        @selected-item-changed=${this.filterFieldSelected}
      ></vaadin-combo-box>
    `;
  }

  renderOperatorSelect() {
    return html`<vaadin-combo-box
      id="operator-select"
      label="Operator"
      .items=${this.activeFilter?.availableOperators}
      @selected-item-changed=${this.filterOperatorSelected}
      .selectedItem=${this.activeFilter?.availableOperators[0]}
    ></vaadin-combo-box>`;
  }

  renderValueEntry() {
    let componentHtml: TemplateResult;
    const fieldType = this?.activeFilter?.field.type;

    if (fieldType === 'boolean') {
      componentHtml = html`<filter-boolean-value
        .filter=${this.activeFilter}
        @value-changed=${() => this.requestUpdate()}
      ></filter-boolean-value>`;
    }
    else if(fieldType === 'number') {
      componentHtml = html`<filter-number-value
      .filter=${this.activeFilter}
      @value-changed=${() => {
        this.requestUpdate();
      }}
    ></filter-number-value>`;
    }
    else {
      componentHtml = html`<filter-string-value
      .filter=${this.activeFilter}
      @value-changed=${() => {
        this.requestUpdate();
      }}
    ></filter-string-value>`;
    }

    return componentHtml;
  }

  renderFilterSelection() {
    return html` <div class="filter-selection">${this.renderFieldSelect()}</div>
      <div class="filter-selection">
        ${this.activeFilter?.field ? this.renderOperatorSelect() : ''}
      </div>
      <div class="filter-selection">
        ${this.activeFilter?.field && this.activeFilter?.operator
          ? this.renderValueEntry()
          : ''}
      </div>
      <div class="filter-button-container">
        <vaadin-button
          @click=${this.addActiveFilterToFilters}
          ?disabled=${this.activeFilter?.field &&
          this.activeFilter?.operator &&
          this.activeFilter?.value
            ? false
            : true}
        >
          Add Filter
        </vaadin-button>
      </div>`;
  }

  renderChips(): TemplateResult {
    return html`<div style="max-height: 32px;">
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
    </div>`;
  }

  render() {
    return html` <div class="filter-builder">
      ${this.renderFilterSelection()}
    </div>
    ${this.renderChips()}`;
  }
}
