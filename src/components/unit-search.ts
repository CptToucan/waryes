import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {Unit} from '../types/unit';
import {
  BundleManagerService,
  UNIT_SEARCH_IGNORED_CHARACTERS
} from '../services/bundle-manager';
import {
  ComboBoxFilterChangedEvent,
  ComboBoxSelectedItemChangedEvent,
} from '@vaadin/combo-box';
import '@vaadin/multi-select-combo-box';
import {MultiSelectComboBoxSelectedItemsChangedEvent} from '@vaadin/multi-select-combo-box';
import type {ComboBoxLitRenderer} from '@vaadin/combo-box/lit.js';
import {comboBoxRenderer} from '@vaadin/combo-box/lit.js';

@customElement('unit-search')
export class UnitSearch extends LitElement {
  static get styles() {
    return css`
      :host {
        display: flex;
      }

      vaadin-combo-box,
      vaadin-multi-select-combo-box {
        font-size: var(--lumo-font-size-l);
        flex: 1 1 0;
        width: 100%;
        margin: 0;
      }

      vaadin-input-container {
        height: 1px;
      }
    `;
  }

  @property()
  multi = false; 


  private _selectedUnits: Unit[] = [];

  @property()
  public get selectedUnits(): Unit[] {
    return this._selectedUnits;
  }
  public set selectedUnits(value: Unit[]) {
    this._selectedUnits = value;
  }

  // Storage for manual filtering of comboboxes
  @property()
  filteredUnits: Unit[] = [];

  units?: Unit[] = [];

  /**
   * Filter units based on text change in combobox and its derivatives.  Use the unit objects
   * _searchNameHelper instead of name to remove a lot of punctuation and other search gotchas.
   *
   * Updates this.filteredUnits
   *
   * @param e ComboBoxFilterChangedEvent
   */
  private filterChanged(e: ComboBoxFilterChangedEvent) {
    const filter = e.detail.value.replace(UNIT_SEARCH_IGNORED_CHARACTERS, '');
    if (filter) {
      this.filteredUnits =
        this.units?.filter((u) =>
          u._searchNameHelper.toLowerCase().includes(filter.toLowerCase())
        ) ?? [];
    }
  }

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

  /**
   * Handle custom events fired by combobox using @opened-changed event.  This event
   * is identified by the type "opened-changed".  If the box has been closed, we reset
   * the current filter.
   *
   * @param event
   */
  multiSelectComboBoxOpenChanged(event: CustomEvent) {
    // If the combobox closes, we reset the filter
    // otherwise the input text goes blank, but the filtered units stays filtered
    if (event.type === 'opened-changed' && event.detail.value === false) {
      this.filteredUnits = this.units ?? [];
    }
  }

  async firstUpdated() {
    const units = await BundleManagerService.getUnits();

    if (units != null) {
      const sortedUnits = units
        .filter((unit) => unit._display === true)
        .sort((a, b) => {
          if (a.name < b.name) {
            return -1;
          }
          if (a.name > b.name) {
            return 1;
          }
          return 0;
        });

      this.filteredUnits = this.units = sortedUnits;
      this.requestUpdate();
    }
  }

  renderMulti() {
    return html` <vaadin-multi-select-combo-box
      placeholder="Search for unit"
      .items=${this.units}
      .selectedItems=${this.selectedUnits}
      @selected-items-changed=${this.multiSelectComboBoxUnitsSelected}
      item-label-path="name"
      ?clear-button-visible=${true}
      .filteredItems=${this.filteredUnits}
      @filter-changed=${this.filterChanged}
      @opened-changed=${this.multiSelectComboBoxOpenChanged}
      ${comboBoxRenderer(this.renderer, [])}
    ></vaadin-multi-select-combo-box>`;
  }

  /**
   * Styles for this rendered search result are kept in the app.css, as they are rendered in the light DOM
   * @param unit
   * @returns
   */
  private renderer: ComboBoxLitRenderer<Unit> = (unit) => html`
    <div style="display: flex; flex-direction: row;">
      <div class="unit-search-result">
        <div class="unit-graphics">
          <country-flag .country=${unit.unitType.motherCountry}></country-flag>
          <div class="unit-image-wrapper">
            <unit-image .unit=${unit}></unit-image>
          </div>
        </div>

        <div class="unit-information">
          <div class="unit-name">${unit.name}</div>
        </div>
      </div>
      <div style="display: flex; flex-direction: column; align-items: flex-end; justify-content: center; flex: 1 1 100%; padding-left: var(--lumo-space-xs);">
        <mod-image style="height: 10px;" .mod=${unit.mod}></mod-image>
      </div>
    </div>
  `;

  render(): TemplateResult {
    return html`
      ${this.multi
        ? this.renderMulti()
        : html` <vaadin-combo-box
            placeholder="Search for unit"
            .items=${this.units}
            .selectedItem=${this.selectedUnits[0]}
            item-label-path="name"
            @selected-item-changed=${this.comboBoxUnitSelected}
            .filteredItems="${this.filteredUnits}"
            @filter-changed="${this.filterChanged}"
            ${comboBoxRenderer(this.renderer, [])}
          ></vaadin-combo-box>`}
    `;
  }

}

declare global {
  interface HTMLElementTagNameMap {
    'unit-search': UnitSearch;
  }
}
