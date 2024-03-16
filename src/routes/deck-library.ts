import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {Country, Division, DivisionsMap} from '../types/deck-builder';
import '../components/deck-library/deck-list-item';
import {UnitMap} from '../types/unit';
import {dialogRenderer} from '@vaadin/dialog/lit.js';
import '../components/deck-library/deck-filters';
import '../components/pagination-controls';
import { BucketFolder, BundleManagerService } from '../services/bundle-manager';


export type DeckLibraryItem = {
  id: string;
  name: string;
  description: string;
  division: string;
  code: string;
  vote_count: number;
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
      tags: this.selectedTags,
      pro: this.selectedPro,
    });
  }

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
   * Returns a map of unit descriptors to unit objects
   * @returns A map of unit descriptors to unit objects
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
   *  Returns an array of query constraints based on the provided parameters
   * @param division  The division to filter by
   * @param country  The country to filter by
   * @param pro Whether to filter by pro decks
   * @param tags  The tags to filter by
   * @param page The page to query
   */
  async queryDatabase(
    {
      division,
      tags,
      pro,
    }: {
      division: Division | null | undefined;
      tags: string[];
      pro: boolean;
    },
    page: number = this.currentPage
  ) {

    // request the decks collection from the database

    const response = await fetch(`http://localhost:8090/api/deck?page=${page}`);
    const decksJson = await response.json();
    const decks = decksJson.data;
    console.log(decks);
    console.log(page);


    const queryConditions: string[] = this.getQueryConstraints(
      division,
      pro,
      tags
    );

    console.log(queryConditions);

    this.decks = decks;
    this.currentPage = page;
    this._isNextPageAvailable = decksJson.meta.hasNextPage;


    this.requestUpdate();
  }

  /**
   * Returns an array of query constraints based on the provided parameters
   * Used to query the database for the total number of decks that match the provided parameters
   * @param division  The division to filter by
   * @param country The country to filter by
   * @param pro Whether to filter by pro decks
   * @param tags The tags to filter by
   * @returns
   */
  private getQueryConstraints(
    _division: Division | null | undefined,
    _pro: boolean,
    _tags: string[]
  ) {
   
    const queryConditions: string[] = [];
 /*
    queryConditions.push(where('public', '==', true));

    if (division) {
      queryConditions.push(where('division', '==', division?.descriptor));
    }

    if (pro) {
      queryConditions.push(where('is_pro_deck', '==', pro));
    }

    if (tags.length > 0) {
      queryConditions.push(where('tags', 'array-contains-any', tags));
    }
    */
    return queryConditions;
  }

  /**
   * Changes the page of decks that are displayed
   * @param page The page to change to
   */
  changePage(page: number) {
    this.selectedDivision = null;
    this.selectedTags = [];
    this.selectedPro = false;

    console.log(page);

    this.queryDatabase(
      {
        division: this.selectedDivision,
        tags: this.selectedTags,
        pro: this.selectedPro,
      },
      page
    );
  }

  render(): TemplateResult {
    return html`<div class="container">
        <div class="control-bar">
          <h1>Deck Library</h1>
          <div class="control-bar-right">
            <vaadin-button
              class="filters-toggle"
              @click=${() => {
                this.toggleFiltersDialog();
              }}
            >
              <vaadin-icon icon="vaadin:filter" slot="prefix"></vaadin-icon>
              Filters
            </vaadin-button>
          </div>
        </div>

        <div class="body">
          <div class="decks">
            ${this.decks.map(
              (deck) => {
                const isOutdated = new Date(deck.updatedAt) < ( this.lastPatchDate || new Date());
                return html`
                <deck-list-item
                  .deck=${deck}
                  .unitMap=${this.unitMap}
                  .divisionsMap=${this.divisionsMap}
                  .isOutdated=${isOutdated}
                ></deck-list-item>
              `}
            )}
          </div>
          <div class="filters">
            <deck-filters
              .selectedTags=${this.selectedTags}
              .selectedDivision=${this.selectedDivision}
              .pro=${this.selectedPro}
              @filters-changed=${(event: CustomEvent) => {
                this.selectedDivision = event.detail.division;
                this.selectedTags = event.detail.tags;
                this.selectedPro = event.detail.pro;

                this.queryDatabase(
                  {
                    division: this.selectedDivision,
                    tags: this.selectedTags,
                    pro: this.selectedPro,
                  },
                  1
                );
              }}
            ></deck-filters>
            <pagination-controls
              .page=${this.currentPage}
              .isNextPageAvailable=${this._isNextPageAvailable}
              style="width: 100%; display: flex; justify-content: space-between; align-items: center;"
              @page-changed=${(event: CustomEvent) => {
                this.changePage(event.detail.page);
              }}
            ></pagination-controls>
          </div>
        </div>
        <div id="mobile-pagination">
          <pagination-controls
            .page=${this.currentPage}
            .isNextPageAvailable=${this._isNextPageAvailable}
            style="width: 100%; display: flex; justify-content: space-between; align-items: center;"
            @page-changed=${(event: CustomEvent) => {
              this.changePage(event.detail.page);
            }}
          ></pagination-controls>
        </div>
      </div>
      <vaadin-dialog
        header-title="Apply filters"
        @opened-changed=${(event: CustomEvent) => {
          if (event.detail.value === false) {
            this.closeFiltersDialog();
          }
        }}
        ${dialogRenderer(
          () =>
            html`
              <deck-filters
                style="width: unset;"
                .selectedTags=${this.selectedTags}
                .selectedDivision=${this.selectedDivision}
                .pro=${this.selectedPro}
                @filters-changed=${(event: CustomEvent) => {
                  this.selectedDivision = event.detail.division;
                  this.selectedTags = event.detail.tags;
                  this.selectedPro = event.detail.pro;

                  this.queryDatabase(
                    {
                      division: this.selectedDivision,
                      tags: this.selectedTags,
                      pro: this.selectedPro,
                    },
                    1
                  );
                  this.closeFiltersDialog();
                }}
              ></deck-filters>
            `,
          []
        )}
        .opened="${this.filtersDialogOpen}"
      ></vaadin-dialog> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'deck-library-route': DeckLibraryRoute;
  }
}
