import {css, html, LitElement, TemplateResult, render} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import '@vaadin/button';
import '@vaadin/grid';
import '@vaadin/grid/vaadin-grid-sort-column.js';
import {GridColumn, GridItemModel} from '@vaadin/grid';
import {UnitsDatabaseService} from '../services/units-db';
import {FieldMetadata, Unit, UnitFieldType} from '../types/unit';
import {router} from '../services/router';
import './filters-builder';
import '@vaadin/accordion';
import { AbstractFieldMetadata } from '../types/AbstractFieldMetadata';
import { FilterMetadata } from '../types/FilterMetadata';

@customElement('units-table')
export class UnitsTable extends LitElement {
  static get styles() {
    return css`
      vaadin-grid-cell-content vaadin-grid-sorter {
        color: var(--lumo-primary-color);
      }

      vaadin-grid-cell-content {
        color: white;
      }

      vaadin-grid-cell-content a {
        color: var(--lumo-body-text-color);
      }

      :host {
        display: flex;
        flex-direction: column;
        flex: 1 1 0;
      }

      .grid-container {
        flex: 1 1 0;
        display: flex;
        flex-direction: column;
      }

      vaadin-grid {
        flex: 1 1 0;
      }

      .filter-container {
        padding: var(--lumo-space-s);
      }
    `;
  }


  @state()
  filters: FilterMetadata<unknown>[] = [];

  linkCellRenderer(
    root: HTMLElement,
    _: GridColumn,
    model: GridItemModel<Unit>
  ) {
    return render(
      html`<a
        style="width: 200px; overflow: hidden;"
        href=${router.urlForPath('/unit/:unitId', {
          unitId: model.item.descriptorName,
        })}
        >${model.item.name}</a
      >`,
      root
    );
  }

  columns() {
    const _columns: TemplateResult[] = [];

    _columns.push(
      html`<vaadin-grid-sort-column
        path=${'name'}
        width="15em"
        frozen
        resizable
        .renderer=${this.linkCellRenderer}
      ></vaadin-grid-sort-column>`
    );

    for(const fieldName in FieldMetadata.fields) {
      const field = FieldMetadata.fields[fieldName];

      if(field.fieldType === UnitFieldType.UNIT && !['weapons', 'name', 'id', 'descriptorName'].includes(fieldName)) {
        _columns.push(
          html`<vaadin-grid-sort-column
            path=${fieldName}
            resizable
          >${field.label}</vaadin-grid-sort-column>`
        );
      }
    }

    return _columns;
  }

  @state()
  private units: Unit[] = [];

  async fetchUnits() {
    const units = await UnitsDatabaseService.fetchUnits();

    if (units) {
      const sortedUnits = units
        ?.filter((unit) => unit._display === true)
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
    } else {
      this.units = [];
    }
  }

  async firstUpdated() {
    await this.fetchUnits();
  }

  filtersChanged(event: CustomEvent) {
    this.filters = event.detail.value;
    this.requestUpdate();
  }

  render(): TemplateResult {
    const fields: AbstractFieldMetadata<unknown>[] = [];
    for(const fieldName in FieldMetadata.fields) {
      const field = FieldMetadata.fields[fieldName];

      if(field.fieldType === UnitFieldType.UNIT) {
        fields.push(field)
      }
    }

    let filteredUnits: Unit[] = [...this.units];

    for (const filter of this.filters) {
      const filterFunction = filter.getFilterFunctionForOperator();
      filteredUnits = filteredUnits.filter(filterFunction(filter));
    }

    return html`
      <div class="grid-container">
        <div class="filter-container">
          <vaadin-accordion .opened=${null}>
            <vaadin-accordion-panel>
              <div slot="summary">Filters</div>
              <filters-builder @filters-changed=${this.filtersChanged} .availableFields=${fields}></filters-builder>
            </vaadin-accordion-panel>
          </vaadin-accordion>
        </div>
        <vaadin-grid .items="${filteredUnits}"> ${this.columns()} </vaadin-grid>
      </div>
    `;
  }
}
