import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, query, state} from 'lit/decorators.js';
import {IonSearchbar} from '@ionic/core/components/ion-searchbar';
import {UnitService} from '../services/unit';
import {WarnoUnit} from '../types';

@customElement('search-results')
export class SearchResults extends LitElement {
  static get styles() {
    return css`
      ion-searchbar {
        --background: var(--ion-panel-background-color) !important;
        --color: var(--ion-color-light) !important;
        --placeholder-color: var(--ion-color-light) !important;
      }

      .search-result {
        display: flex;
        justify-content: space-between;
        padding-top: 4px;
        padding-bottom: 4px;
      }

      .name {
        color: var(--ion-color-light);
        font-weight: bold;
      }

      .or {
        color: var(--ion-color-light);
        text-align: center;
        font-size: 24px;
        padding-top: 8px;
        padding-bottom: 8px;
      }

      .link {
        display: flex;
        justify-content: center;
      }
    `;
  }

  @query('ion-searchbar')
  searchBar!: IonSearchbar;

  @state()
  searchValue = '';

  @state()
  searchedUnits: WarnoUnit[] | null = null;

  async search(event: { detail: { value: string; }; }) {
    this.searchValue = event.detail.value;
    const foundUnits: WarnoUnit[] = await UnitService.findUnitsByName(
      this.searchValue
    );
    this.searchedUnits = foundUnits;
  }

  renderSearchResults(): TemplateResult {
    if (this.searchedUnits !== null && this.searchValue !== '') {
      const results: TemplateResult[] = this.searchedUnits.map(
        (unit: WarnoUnit) =>
          html`
            <ion-router-link href="/unit/${unit.id}">
              <div class="search-result">
                <div class="name">${unit.name}</div>
                <div class="value">${unit.commandPoints}</div>
              </div>
            </ion-router-link>
          `
      );
      return html`<div class="search-results">${results}</div>`;
    }
    return this.renderViewAll();
  }

  renderViewAll(): TemplateResult {
    return html`
      <div>
        <div class="or">OR</div>
        <div class="link">
          <ion-router-link href="/units-list">
            <ion-button>View All</ion-button>
          </ion-router-link>
        </div>
      </div>
    `;
  }

  render() {
    return html` <ion-searchbar
        @ionChange=${this.search}
        debounce="250"
        placeholder="Search Units"
      ></ion-searchbar>
      ${this.renderSearchResults()}`;
  }
}
