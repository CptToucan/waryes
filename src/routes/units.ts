import {BeforeEnterObserver} from '@vaadin/router';
import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {BundleManagerService, BucketFolder} from '../services/bundle-manager';
import {Division} from '../types/deck-builder';
import {Unit} from '../types/unit';
import {getIconsWithFallback} from '../utils/get-icons-with-fallback';
import {dialogRenderer, dialogFooterRenderer} from '@vaadin/dialog/lit.js';
import "../components/filter/division-filter";

@customElement('units-route')
export class UnitsRoute extends LitElement implements BeforeEnterObserver {
  static get styles() {
    return css`
      :host {
        display: flex;
        flex-direction: column;
        height: 100%;
      }

      h1,
      h3 {
        margin: 0;
      }

      .unit {
        display: flex;
        background-color: var(--lumo-contrast-5pct);
        font-size: var(--lumo-font-size-s);
        border-radius: var(--lumo-border-radius);
        padding: var(--lumo-space-s);
        height: 25px;
        align-items: center;
        overflow: hidden;
      }

      a {
        text-decoration: none;
        color: inherit;
      }

      .grid {
        flex: 1 1 0;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        grid-gap: var(--lumo-space-m);
        align-content: start;
      }

      .unit-name {
        display: flex;
        flex: 1 1 0;
        align-items: center;
        font-size: var(--lumo-font-size-xs);
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
      }

      .page-content {
        display: flex;
        flex-direction: row;
        flex: 1 1 0%;
        min-height: 0;
      }

      .page-content > .filters {
        flex: 0 0 400px;
        padding-left: var(--lumo-space-m);
        padding-right: var(--lumo-space-m);
      }

      .page-content > .grid {
        flex: 1 1 0;
        height: 100%;
        overflow-y: scroll;
      }

      .filter-builder {
        background-color: var(--lumo-contrast-5pct);
        border-radius: var(--lumo-border-radius);
        padding: var(--lumo-space-s);
      }

      .page-header {
        padding: var(--lumo-space-m);
        display: flex;
        flex-direction: row;
        justify-content: space-between;
      }

      .header {
        display: flex;
        gap: var(--lumo-space-s);
        justify-content: space-between;
        align-items: center;
        width: 100%;
      }

      country-flag {
        overflow: hidden;
        height: 20px;
      }

      mod-image {
        height: 8px;
      }

      unit-image {
        width: 64px;
        border-radius: var(--lumo-border-radius);
        overflow: hidden;
      }

      @media (min-width: 1040px) {
        .mobile-only {
          display: none;
        }
      }

      @media (max-width: 1040px) {
        .desktop-only {
          display: none;
        }
      }
    `;
  }

  @state()
  units: Unit[] = [];

  @state()
  filteredUnits?: Unit[];

  @state()
  divisionsToFilterBy: Division[] = [];

  @state()
  nameFilter = '';

  @state()
  divisions: Division[] = [];

  @state()
  showingFiltersDialog = false;

  public showDialog() {
    this.showingFiltersDialog = true;
  }
  public closeDialog() {
    this.showingFiltersDialog = false;
  }

  async onBeforeEnter() {
    let units = await BundleManagerService.getUnits();
    const divisions = await BundleManagerService.getDivisionsForBucket(BucketFolder.WARNO) || [];

    // sort by motherCountry

    units = units.sort((a, b) => {
      const iconA = getIconsWithFallback(a);
      const iconB = getIconsWithFallback(b);
      if ((iconA.icon || '') < (iconB.icon || '')) {
        return -1;
      }
      if ((iconA.icon || '') > (iconB.icon || '')) {
        return 1;
      }
      return 0;
    });

    this.units = units;
    this.filteredUnits = units;
    this.divisions = divisions;
  }

  filterByDivision(filteredDivisions: Division[]) {
    if (filteredDivisions.length === 0) {
      this.filteredUnits = this.units;
      return;
    }

    this.filteredUnits = this.units.filter((unit) => {
      // find unit with at least 1 division in list of filtered divisions
      return unit.divisions.some((division) => {
        return filteredDivisions.some((filteredDivision) => {
          return division === filteredDivision.descriptor;
        });
      });
    });
  }

  filter() {
    const filteredDivisions = this.divisionsToFilterBy;
    const filteredName = this.nameFilter;

    if (filteredDivisions.length === 0 && filteredName === '') {
      this.filteredUnits = this.units;
      return;
    }

    this.filteredUnits = this.units.filter((unit) => {
      // find unit with at least 1 division in list of filtered divisions
      const matchesDivision =
        filteredDivisions.length === 0 ||
        unit.divisions.some((division) => {
          return filteredDivisions.some((filteredDivision) => {
            return division === filteredDivision.descriptor;
          });
        });

      const matchesName =
        filteredName === '' ||
        unit._searchNameHelper
          .toLowerCase()
          .includes(filteredName.toLowerCase());

      return matchesDivision && matchesName;
    });
  }

  debounce(fn: Function, ms = 300) {
    let timeoutId: ReturnType<typeof setTimeout>;
    return function (this: any, ...args: any[]) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(this, args), ms);
    };
  }

  renderFiltersBuilder(): TemplateResult {
    return html` <div class="filter-builder">
      <vaadin-text-field
        style="width: 100%;"
        label="Name"
        @input=${(event: any) => {
          const value = event.target.value;
          this.nameFilter = value;

          const debouncedFilter = this.debounce(this.filter.bind(this), 200);
          debouncedFilter();
        }}
      ></vaadin-text-field>
      <division-filter
        .divisions=${this.divisions}
        @division-filter-changed=${(event: any) => {
          this.divisionsToFilterBy = event.detail.divisions;
          const debouncedFilter = this.debounce(this.filter.bind(this), 200);
          debouncedFilter();
        }}
      ></division-filter>
    </div>`;
  }

  render(): TemplateResult {
    return html`
      <div class="page-header">
        <h1>Units</h1>
        <vaadin-button
          class="mobile-only"
          @click=${() => {
            this.showDialog();
          }}
          >Filters</vaadin-button
        >
      </div>
      <div class="page-content">
        <div class="filters desktop-only">${this.renderFiltersBuilder()}</div>
        <div class="grid units">
          ${(this.filteredUnits || []).length > 0
            ? this.filteredUnits?.map((unit) => {
                return html`<a class="unit" href="/unit/${unit.descriptorName}">
                  <div class="header">
                    <unit-image .unit=${unit}></unit-image>

                    <div class="unit-name">${unit.name}</div>
                    <mod-image .mod=${unit.mod}></mod-image>
                    <country-flag
                      .country=${unit.unitType.motherCountry}
                    ></country-flag>
                  </div>
            </a>`;
              })
            : html`<div class="no-units">No units found</div>`}
        </div>
      </div>

      <vaadin-dialog
        header-title="Filter"
        @opened-changed=${(event: CustomEvent) => {
          if (event.detail.value === false) {
            this.closeDialog();
          }
        }}
        ${dialogRenderer(() => html`${this.renderFiltersBuilder()}`)}
        ${dialogFooterRenderer(
          () =>
            html`<vaadin-button @click="${this.closeDialog}">Close</vaadin-button> `,
          []
        )}
        .opened="${this.showingFiltersDialog}"
      ></vaadin-dialog>
    `;
  }
}
