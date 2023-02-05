import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {Unit} from '../types/unit';
import {UnitsDatabaseService} from '../services/units-db';
import {ComboBoxSelectedItemChangedEvent} from '@vaadin/combo-box';
import '@vaadin/multi-select-combo-box';
import {MultiSelectComboBoxSelectedItemsChangedEvent} from '@vaadin/multi-select-combo-box';

@customElement('unit-search')
export class UnitSearch extends LitElement {
  static get styles() {
    return css`
      :host {
        max-width: 512px;
      }

      vaadin-combo-box,
      vaadin-multi-select-combo-box {
        font-size: var(--lumo-font-size-xl);
        flex: 1 1 0;
        width: 100%;
        height: var(--lumo-size-xl);
      }
    `;
  }

  @property()
  multi = false;

  @property()
  selectedUnits: Unit[] = [];

  units?: Unit[] = [];

  comboBoxUnitSelected(event: ComboBoxSelectedItemChangedEvent<Unit>) {
    if (event.detail.value) {
      this.dispatchEvent(
        new CustomEvent('unit-selected', {detail: {value: event.detail.value}})
      );
    }
  }

  multiSelectComboBoxUnitsSelected(
    event: MultiSelectComboBoxSelectedItemsChangedEvent<Unit>
  ) {
    if (event.detail.value) {
      this.dispatchEvent(
        new CustomEvent('units-selected', {detail: {value: event.detail.value}})
      );
    }
  }

  async firstUpdated() {
    const units = await UnitsDatabaseService.fetchUnits();

    if (units !== null) {
      const sortedUnits = units
        .filter((unit) => unit.name !== '')
        .sort((a, b) => {
          if (a.name < b.name) {
            return -1;
          }
          if (a.name > b.name) {
            return 1;
          }
          return 0;
        });

      this.units = sortedUnits;
      this.requestUpdate();
    }
  }

  renderMulti() {
    return html` <vaadin-multi-select-combo-box
      placeholder="Search for Warno unit"
      .items=${this.units}
      .selectedItems=${this.selectedUnits}
      @selected-items-changed=${this.multiSelectComboBoxUnitsSelected}
      item-label-path="name"
      ?clear-button-visible=${true}
    ></vaadin-multi-select-combo-box>`;
  }

  render(): TemplateResult {
    return html`
      ${this.multi
        ? this.renderMulti()
        : html` <vaadin-combo-box
            placeholder="Search for Warno unit"
            .items=${this.units}
            item-label-path="name"
            @selected-item-changed=${this.comboBoxUnitSelected}
          ></vaadin-combo-box>`}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'unit-search': UnitSearch;
  }
}