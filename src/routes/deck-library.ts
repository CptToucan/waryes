import {
  collection,
  DocumentData,
  // endBefore,
  getDocs,
  limit,
  orderBy,
  query as queryBuilder,
  QueryDocumentSnapshot,
  QueryConstraint,
  startAt,
  where,
  startAfter,
  endAt,
} from 'firebase/firestore';
import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {FirebaseService} from '../services/firebase';
import {Country, Division, DivisionsMap} from '../types/deck-builder';
import '../components/deck-library/deck-list-item';
import {UnitMap} from '../types/unit';
import {UnitsDatabaseService} from '../services/units-db';
import {DivisionsDatabaseService} from '../services/divisions-db';
import {dialogRenderer} from '@vaadin/dialog/lit.js';
import '../components/deck-library/deck-filters';
import '../components/pagination-controls';

interface PageReference {
  first: DocumentData | null;
  last: DocumentData | null;
}

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

  @state({
    hasChanged: () => {
      return true;
    },
  })
  decks: QueryDocumentSnapshot<DocumentData>[] = [];

  @state()
  private _isNextPageAvailable = false;

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

  private pageReferences: PageReference[] = [];

  private pageStarts: (DocumentData | null)[] = [];

  async firstUpdated() {
    await this.queryFirebase({
      division: null,
      country: null,
      tags: [],
      pro: false,
    });
  }

  async onBeforeEnter() {
    this.unitMap = await this.fetchUnitMap();

    const [units, divisions] = await Promise.all([
      this.fetchUnitMap(),
      this.fetchDivisionMap(),
    ]);

    this.unitMap = units;
    this.divisionsMap = divisions;
  }

  /**
   * Returns a map of unit descriptors to unit objects
   * @returns A map of unit descriptors to unit objects
   */
  async fetchUnitMap() {
    const units = await UnitsDatabaseService.fetchUnits();
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
    const divisions = await DivisionsDatabaseService.fetchDivisions();
    const divisionMap: DivisionsMap = {};

    if (divisions) {
      for (const division of divisions) {
        divisionMap[division.descriptor] = division;
      }
    }

    return divisionMap;
  }

  /**
   *  Returns an array of query constraints based on the provided parameters
   * @param division  The division to filter by
   * @param country  The country to filter by
   * @param pro Whether to filter by pro decks
   * @param tags  The tags to filter by
   * @param page The page to query
   */
  async queryFirebase(
    {
      division,
      country,
      tags,
      pro,
    }: {
      division: Division | null | undefined;
      country: Country | null | undefined;
      tags: string[];
      pro: boolean;
    },
    page: number = this.currentPage
  ) {
    const decksRef = collection(FirebaseService.db, 'decks');

    const queryConditions: QueryConstraint[] = this.getQueryConstraints(
      division,
      country,
      pro,
      tags
    );

    const referenceIndex = page - 1;

    // if the requested page is the first page, reset the pageReferences array
    if (referenceIndex === 0) {
      this.pageReferences = [];
      this.pageStarts = [];
      this.currentPage = 1;
    } else if (
      referenceIndex >= 0 &&
      referenceIndex < this.pageReferences.length
    ) {
      // if the requested page is already loaded, use the pageReferences and pageStarts arrays to set the query conditions
      // to start at the first document of the requested page and end before the last document of the requested page
      const reference = this.pageReferences[referenceIndex];
      const start = this.pageStarts[referenceIndex];
      queryConditions.push(startAt(start));
      queryConditions.push(endAt(reference.last));
      this.currentPage = page;
    } else {
      // if the requested page is not already loaded, use the pageReferences and pageStarts arrays to set the query conditions
      // to start after the last document of the last loaded page
      const lastIndex = this.pageReferences.length - 1;
      const lastReference = this.pageReferences[lastIndex];
      // const lastStart = this.pageStarts[lastIndex];
      if (lastReference) {
        queryConditions.push(startAfter(lastReference.last));
      }
      while (this.pageReferences.length < referenceIndex) {
        // pad the pageReferences and pageStarts arrays with nulls if the requested page has not been loaded yet
        this.pageReferences.push({
          first: null,
          last: null,
        });
        this.pageStarts.push(null);
      }
      this.currentPage = page;
    }

    const q = queryBuilder(
      decksRef,
      orderBy('vote_count', 'desc'),
      limit(this.pageLimit),
      ...queryConditions
    );

    const querySnapshot = await getDocs(q);

    const lastDocument = querySnapshot.docs[querySnapshot.size - 1];
    const firstDocument = querySnapshot.docs[0];

    if (querySnapshot.size < this.pageLimit) {
      this._isNextPageAvailable = false;
    } else {
      this._isNextPageAvailable = true;
    }

    while (this.pageReferences.length < referenceIndex) {
      // pad the pageReferences and pageStarts arrays with nulls if the requested page has not been loaded yet
      this.pageReferences.push({
        first: null,
        last: null,
      });
      this.pageStarts.push(null);
    }
    this.pageReferences[referenceIndex] = {
      first: firstDocument,
      last: lastDocument,
    };
    this.pageStarts[referenceIndex] = firstDocument;
    if (referenceIndex === 0) {
      this.decks = [...querySnapshot.docs];
    } else {
      const start = this.pageStarts[referenceIndex];
      if (start) {
        let startIndex = -1;
        for (let i = 0; i < this.decks.length; i++) {
          if (this.decks[i].id === start.id) {
            startIndex = i;
            break;
          }
        }

        if (startIndex >= 0) {
          // if the starting document for the new page of data is found in the current page, splice the current page
          // to include the new page of data at the appropriate index
          this.decks.splice(
            startIndex + 1,
            this.decks.length - startIndex - 1,
            ...querySnapshot.docs
          );
        } else {
          // if the starting document for the new page of data is not found in the current page, replace the current page
          // with the new page of data
          this.decks = [...querySnapshot.docs];
        }
      } else {
        // if the starting document for the new page of data is not found in the current page, replace the current page
        // with the new page of data
        this.decks = [...querySnapshot.docs];
      }
    }

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
    division: Division | null | undefined,
    country: Country | null | undefined,
    pro: boolean,
    tags: string[]
  ) {
    const queryConditions: QueryConstraint[] = [];

    queryConditions.push(where('public', '==', true));

    if (division) {
      queryConditions.push(where('division', '==', division?.descriptor));
    }

    if (country) {
      queryConditions.push(where('country', '==', country));
    }

    if (pro) {
      queryConditions.push(where('is_pro_deck', '==', pro));
    }

    if (tags.length > 0) {
      queryConditions.push(where('tags', 'array-contains-any', tags));
    }
    return queryConditions;
  }

  /**
   * Changes the page of decks that are displayed
   * @param page The page to change to
   */
  changePage(page: number) {
    this.queryFirebase(
      {
        division: null,
        country: null,
        tags: [],
        pro: false,
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
              (deck) => html`
                <deck-list-item
                  .deck=${deck}
                  .unitMap=${this.unitMap}
                  .divisionsMap=${this.divisionsMap}
                ></deck-list-item>
              `
            )}
          </div>
          <div class="filters">
            <deck-filters
              @filters-changed=${(event: CustomEvent) => {
                this.queryFirebase(event.detail, 1);
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
                @filters-changed=${(event: CustomEvent) => {
                  this.queryFirebase(event.detail, 1);
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
