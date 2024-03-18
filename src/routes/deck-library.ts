import { css, html, LitElement, TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { Country, Division, DivisionsMap } from '../types/deck-builder';
import '../components/deck-library/deck-list-item';
import { UnitMap } from '../types/unit';
import { dialogRenderer } from '@vaadin/dialog/lit.js';
import '../components/deck-library/deck-filters';
import '../components/pagination-controls';
import { BucketFolder, BundleManagerService } from '../services/bundle-manager';
import { DeckDatabaseAdapter } from '../classes/DeckDatabaseAdapter';


export type DeckLibraryItem = {
  id: string;
  name: string;
  description: string;
  division: string;
  code: string;
  country: Country;
  tags: string[];
};

@customElement('deck-library-route')
export class DeckLibraryRoute extends LitElement {
  static get styles() {
    return css`
      .container {
        padding-left: var(--lumo-space-s);
        padding-right: var(--lumo-space-s);
        display: flex;
        height: 100%;
        flex-direction: column;
        max-width: 1200px;
        margin: 0 auto; /* Center the container horizontally */
      }

      .body {
        display: flex;
        flex-direction: row;
        flex: 1 1 100%;
        overflow: hidden;
        column-gap: var(--lumo-space-s);
      }

      .decks {
        display: flex;
        flex-direction: column;
        gap: var(--lumo-space-s);
        width: 100%;
        flex: 1 1 100%;
        overflow-y: scroll;
      }

      .control-bar {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
      }

      h1 {
        margin: 0;
      }

      #mobile-pagination {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: 56px;
        width: 100%;
        background-color: var(--lumo-base-color);
      }

      #mobile-pagination > * {
      }

      @media only screen and (min-width: 801px) {
        .control-bar .filters-toggle,
        #mobile-pagination {
          display: none;
        }
      }

      @media only screen and (max-width: 800px) {
        .filters {
          display: none;
        }

        .decks {
          padding-bottom: calc(32 * 4px);
        }
      }
    `;
  }

  @state()
  filtersDialogOpen = false;

  openFiltersDialog() {
    this.filtersDialogOpen = true;
  }

  closeFiltersDialog() {
    this.filtersDialogOpen = false;
  }

  toggleFiltersDialog() {
    this.filtersDialogOpen = !this.filtersDialogOpen;
  }

  unitMap?: UnitMap;
  divisionsMap?: DivisionsMap;
  lastPatchDate?: Date;

  @state()
  selectedTags: string[] = [];

  @state()
  selectedDivision: Division | null = null;

  @state()
  selectedPro = false;

  @state({
    hasChanged: () => {
      return true;
    },
  })
  decks: any[] = [];

  @state()
  private _isNextPageAvailable = true;

  private _pageLimit = 20;
  public get pageLimit() {
    return this._pageLimit;
  }
  public set pageLimit(value) {
    this._pageLimit = value;
  }

  private _currentPage = 1;
  public get currentPage() {
    return this._currentPage;
  }
  public set currentPage(value) {
    this._currentPage = value;
  }

  async firstUpdated() {
    await this.queryDatabase({
      division: this.selectedDivision,
      pro: this.selectedPro,
    });
  }

  /**
   * Performs necessary operations before entering the route.
   * Fetches the unit map, division map, and last patch date asynchronously.
   * Updates the unit map, divisions map, and last patch date properties.
   */
  async onBeforeEnter() {
    this.unitMap = await this.fetchUnitMap();

    const [units, divisions, lastPatch] = await Promise.all([
      this.fetchUnitMap(),
      this.fetchDivisionMap(),
      this.fetchLastPatch(),
    ]);

    this.unitMap = units;
    this.divisionsMap = divisions;
    this.lastPatchDate = lastPatch;
  }


  /**
   * Fetches the unit map by calling the `getUnitsForBucket` method of the `BundleManagerService` class.
   * The unit map is a dictionary where the keys are the descriptor names of the units and the values are the units themselves.
   * @returns The unit map.
   */
  async fetchUnitMap() {
    const units = await BundleManagerService.getUnitsForBucket(BucketFolder.WARNO);
    const unitMap: UnitMap = {};

    if (units) {
      for (const unit of units) {
        unitMap[unit.descriptorName] = unit;
      }
    }

    return unitMap;
  }

  /**
   * Returns a map of division descriptors to division objects
   * @returns A map of division descriptors to division objects
   */
  async fetchDivisionMap() {
    const divisions = await BundleManagerService.getDivisionsForBucket(BucketFolder.WARNO);
    const divisionMap: DivisionsMap = {};

    if (divisions) {
      for (const division of divisions) {
        divisionMap[division.descriptor] = division;
      }
    }

    return divisionMap;
  }

  async fetchLastPatch() {
    return new Date();
  }

  /**
   * Queries the database for decks based on the provided parameters.
   * 
   * @param {Object} options - The query options.
   * @param {Division | null | undefined} options.division - The division to filter decks by.
   * @param {boolean} options.pro - Indicates whether to filter decks by pro status.
   * @param {number} [page=this.currentPage] - The page number to retrieve.
   * @returns {Promise<void>} - A promise that resolves when the query is complete.
   */
  async queryDatabase(
    {
      division,
      pro,
    }: {
      division: Division | null | undefined;
      pro: boolean;
    },
    page: number = this.currentPage
  ) {

    const queryConditions = this.getQueryConstraints(
      division,
      pro
    );

    const response = await DeckDatabaseAdapter.getDecks(page, 20, queryConditions);
    const decks = response.data;

    this.decks = decks;
    this.currentPage = page;
    this._isNextPageAvailable = response.meta.hasNextPage;


    this.requestUpdate();
  }


  /**
   * Returns the query constraints based on the provided division and pro flag.
   * @param _division - The division to filter the query by.
   * @param _pro - A boolean flag indicating whether to include pro conditions in the query.
   * @returns An object containing the query conditions.
   */
  private getQueryConstraints(
    _division: Division | null | undefined,
    _pro: boolean
  ) {

    const queryConditions: { division?: string, tags: string[], pro: boolean } = {
      tags: [],
      pro: false
    };

    if (_division) {
      queryConditions.division = (_division.descriptor);
    }

    if (_pro) {
      queryConditions.pro = _pro;
    }



    return queryConditions;
  }

  /**
   * Renders the template for the Deck Library component.
   * @returns {TemplateResult} The rendered template.
   */
  render(): TemplateResult {
    return html`
      <div class="container">
        ${this.renderControlBar()}
        <div class="body">
          <div class="decks">
            ${this.renderDeckListItems()}
          </div>
          <div class="filters">
            ${this.renderDeckFilters()}
            ${this.renderPaginationControls()}
          </div>
        </div>
        ${this.renderMobilePagination()}
      </div>
      ${this.renderFiltersDialog()}
    `;
  }

  /**
   * Renders the control bar section of the template.
   * @returns {TemplateResult} The rendered control bar template.
   */
  private renderControlBar(): TemplateResult {
    return html`
      <div class="control-bar">
        <h1>Deck Library</h1>
        <div class="control-bar-right">
          <vaadin-button class="filters-toggle" @click=${this.toggleFiltersDialog}>
            <vaadin-icon icon="vaadin:filter" slot="prefix"></vaadin-icon>
            Filters
          </vaadin-button>
        </div>
      </div>
    `;
  }

  /**
   * Renders the deck list items section of the template.
   * @returns {TemplateResult} The rendered deck list items template.
   */
  private renderDeckListItems(): TemplateResult[] {
    return this.decks.map((deck) => {
      const isOutdated = new Date(deck.updatedAt) < (this.lastPatchDate || new Date());
      return html`
        <deck-list-item
          .deck=${deck}
          .unitMap=${this.unitMap}
          .divisionsMap=${this.divisionsMap}
          .isOutdated=${isOutdated}
        ></deck-list-item>
      `;
    });
  }

  /**
   * Renders the deck filters section of the template.
   * @returns {TemplateResult} The rendered deck filters template.
   */
  private renderDeckFilters(): TemplateResult {
    return html`
      <deck-filters
        .selectedDivision=${this.selectedDivision}
        .pro=${this.selectedPro}
        @filters-changed=${this.handleFiltersChanged}
      ></deck-filters>
    `;
  }

  /**
   * Renders the pagination controls section of the template.
   * @returns {TemplateResult} The rendered pagination controls template.
   */
  private renderPaginationControls(): TemplateResult {
    return html`
      <pagination-controls
        .page=${this.currentPage}
        .isNextPageAvailable=${this._isNextPageAvailable}
        style="width: 100%; display: flex; justify-content: space-between; align-items: center;"
        @page-changed=${this.handleChangePage}
      ></pagination-controls>
    `;
  }

  /**
   * Renders the mobile pagination section of the template.
   * @returns {TemplateResult} The rendered mobile pagination template.
   */
  private renderMobilePagination(): TemplateResult {
    return html`
      <div id="mobile-pagination">
        <pagination-controls
          .page=${this.currentPage}
          .isNextPageAvailable=${this._isNextPageAvailable}
          style="width: 100%; display: flex; justify-content: space-between; align-items: center;"
          @page-changed=${this.handleChangePage}
        ></pagination-controls>
      </div>
    `;
  }

  /**
   * Renders the filters dialog section of the template.
   * @returns {TemplateResult} The rendered filters dialog template.
   */
  private renderFiltersDialog(): TemplateResult {
    return html`
      <vaadin-dialog
        header-title="Apply filters"
        @opened-changed=${this.handleFiltersDialogOpenedChanged}
        ${dialogRenderer(() => this.renderDeckFilters(), [])}
        .opened="${this.filtersDialogOpen}"
      ></vaadin-dialog>
    `;
  }

  /**
   * Event handler for the filters changed event.
   * @param {CustomEvent} event - The filters changed event.
   */
  private handleFiltersChanged(event: CustomEvent): void {
    this.selectedDivision = event.detail.division;
    this.selectedPro = event.detail.pro;

    this.queryDatabase(
      {
        division: this.selectedDivision,
        pro: this.selectedPro,
      },
      1
    );
  }

  /**
   * Event handler for the page changed event.
   * @param {CustomEvent} event - The page changed event.
   */
  private handleChangePage(event: CustomEvent): void {
    this.changePage(event.detail.page);
  }

  /**
   * Event handler for the filters dialog opened changed event.
   * @param {CustomEvent} event - The filters dialog opened changed event.
   */
  private handleFiltersDialogOpenedChanged(event: CustomEvent): void {
    if (event.detail.value === false) {
      this.closeFiltersDialog();
    }
  }

  /**
   * Changes the page of decks that are displayed.
   * @param {number} page - The page to change to.
   */
  private changePage(page: number): void {
    this.selectedDivision = null;
    this.selectedPro = false;

    this.queryDatabase(
      {
        division: this.selectedDivision,
        pro: this.selectedPro,
      },
      page
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'deck-library-route': DeckLibraryRoute;
  }
}
