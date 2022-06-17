import {css, html, LitElement, TemplateResult, render} from 'lit';
import {customElement, query, state} from 'lit/decorators.js';
import {fieldType, UnitMetadata} from '../types';
import {UnitService} from '../services/unit';
import {IonModal} from '@ionic/core/components/ion-modal';
import '@vaadin/grid';
import '@vaadin/grid/vaadin-grid-sort-column.js';
import '@vaadin/grid/vaadin-grid-column-group.js';
import {
  GridColumn,
  GridItemModel,
  GridSorterDirection,
  Grid,
} from '@vaadin/grid';
import {animate} from '@lit-labs/motion';
import {FilterMetadata} from '../metadata/FilterMetadata';
import {GridSorterDirectionChangedEvent} from '@vaadin/grid/vaadin-grid-sorter';
import {IonGrid} from '@ionic/core/components/ion-grid';
import {IonContent} from '@ionic/core/components/ion-content';
@customElement('units-list-route')
export class UnitsListRoute extends LitElement {
  static get styles() {
    return css``;
  }

  @query('ion-modal')
  modal!: IonModal;

  @query('ion-grid')
  ionGrid!: IonGrid;

  @query('#units-list-content')
  ionContent!: IonContent;

  @query('vaadin-grid')
  grid!: Grid;

  protected createRenderRoot() {
    return this;
  }

  @state()
  units: UnitMetadata[] = [];

  @state()
  filters: FilterMetadata<unknown>[] = [];

  @state()
  columns: TemplateResult[] = [];

  @state()
  showFilterSelection = false;

  @state()
  sort?: {field: string; direction: GridSorterDirection};

  filtersChanged(event: CustomEvent) {
    this.filters = event.detail.value;
    this.requestUpdate();
  }

  sortChanged(event: GridSorterDirectionChangedEvent) {
    console.log(event);
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('resize', this.resize.bind(this));
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('resize', this.resize.bind(this));
  }

  resize() {
    this.grid.style.height = `${
      this.ionContent.clientHeight - this.ionGrid.clientHeight - 80
    }px`;
  }

  async firstUpdated() {
    this.units = UnitService.units;

    const columns: TemplateResult[] = [];
    //const unitFieldColumns: TemplateResult[] = [];

    columns.push(
      html`<vaadin-grid-sort-column
        path=${UnitService.metadata.name.id}
        width="15em"
        frozen
        resizable
        .headerRenderer=${this.headerRenderer}
        .renderer=${this.linkCellRenderer}
      ></vaadin-grid-sort-column>`
    );

    for (const fieldMetadata of [
      ...UnitService.findFieldMetadataByType(fieldType.STATIC),
      ...UnitService.findFieldMetadataByType(fieldType.PLATOON),
    ]) {
      if (fieldMetadata.id !== 'name') {
        columns.push(
          html`<vaadin-grid-sort-column
            auto-width
            resizable
            path=${fieldMetadata.id}
            .headerRenderer=${this.headerRenderer}
            @direction-changed=${this.sortChanged}
          ></vaadin-grid-sort-column>`
        );
      }
    }

    /*
    for (const weapon of ['weaponOne', 'weaponTwo', 'weaponThree']) {
      columns.push(html`<vaadin-grid-column-group header=${weapon}>
        ${weaponStats.map((weaponField) => {
          return html`<vaadin-grid-sort-column
            auto-width
            resizable
            path=${`${weapon}.${weaponField}`}
          ></vaadin-grid-sort-column>`;
        })}
      </vaadin-grid-column-group>`);
    }
    */

    this.columns = columns;
    setTimeout(() => this.resize());
  }

  linkCellRenderer(
    root: HTMLElement,
    _: GridColumn,
    model: GridItemModel<UnitMetadata>
  ) {
    return render(
      html`<a style="width: 200px; overflow: hidden;" href="/#/unit/${model.item.id}">${model.item.name}</a>`,
      root
    );
  }

  headerRenderer(root: HTMLElement, cell: GridColumn) {
    return render(
      html`<span
        style="color: var(--ion-color-primary); font-size: 16px; font-weight: bold !important; text-transform: capitalize;"
        >${cell?.path?.split('.').join(' ')}</span
      >`,
      root
    );
  }

  render() {
    const renderGrid = true;
    let filteredUnits: UnitMetadata[] = [...UnitService.units];

    for (const filter of this.filters) {
      const filterFunction = filter.getFilterFunctionForOperator();
      filteredUnits = filteredUnits.filter(filterFunction(filter));
    }

    return html`
      <ion-content id="units-list-content">
        <ion-grid>
          <ion-row class="ion-justify-content-start">
            <ion-col
              style="display: flex; justify-content: space-between; align-items: center"
            >
              <ion-text color="secondary">
                <h1 style="font-weight: bold">Units</h1>
              </ion-text>
              <div>
                <ion-button
                  color="primary"
                  fill="outline"
                  @click=${() => {
                    this.showFilterSelection = !this.showFilterSelection;
                  }}
                >
                  <ion-icon slot="start" name="filter-outline"></ion-icon
                  >Filter</ion-button
                >
              </div>
            </ion-col>
          </ion-row>
          <ion-row>
            <ion-col>
              <table-filters
                ?showFilterSelection=${this.showFilterSelection}
                @filters-changed=${this.filtersChanged}
              ></table-filters>
            </ion-col>
          </ion-row>
        </ion-grid>

        <div ${animate()}>
          ${renderGrid
            ? html` <vaadin-grid
                .items=${filteredUnits}
                theme="no-border no-row-borders compact"
                ${animate()}
              >
                ${this.columns}
              </vaadin-grid>`
            : html``}
        </div>
      </ion-content>
    `;
  }
}
