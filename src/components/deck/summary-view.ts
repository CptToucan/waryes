import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {Deck} from '../../classes/deck';
import {UnitCategory} from '../../types/deck-builder';
import {getCodeForFactoryDescriptor} from '../../utils/get-code-for-factory-descriptor';
import './compact-armoury-card';
import './deck-header';

@customElement('summary-view')
export class SummaryView extends LitElement {
  static get styles() {
    return css`
      :host {
        display: flex;
        flex-direction: column;
      }

      .container {
        display: flex;
        flex-direction: column;
        width: 100%;
        gap: var(--lumo-space-xs);
      }

      h2,
      h3,
      h4 {
        margin: 0;
      }

      @media only screen and (max-width: 700px) {
        .division-title {
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          word-break: unset;
          white-space: nowrap;
        }
      }

      country-flag {
        margin-left: var(--lumo-space-s);
      }

      .armoury-category-cards {
        display: grid;
        padding: var(--lumo-space-xs);
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: var(--lumo-space-xs);
      }

      .card-section h4 {
        padding-left: var(--lumo-space-s);
        padding-right: var(--lumo-space-s);
        color: var(--lumo-contrast-90pct);
      }

      .category-stats {
        display: flex;
        color: var(--lumo-contrast-80pct);
        font-size: var(--lumo-font-size-s);
      }

      .category-stats > * {
        padding-left: var(--lumo-space-s);
        padding-right: var(--lumo-space-s);
      }

      vaadin-details {
        margin: 0;
        background-color: var(--lumo-contrast-5pct);
        border-radius: var(--lumo-border-radius);
        border: 1px solid var(--lumo-contrast-10pct);
      }

      vaadin-details::part(summary) {
        padding-top: 0;
        padding-bottom: 0;
        padding-left: var(--lumo-space-s);
        padding-right: var(--lumo-space-s);
      }
      vaadin-details::part(content) {
        padding: 0;
      }
    `;
  }

  @property()
  deck?: Deck;

  @property()
  showTitle = false;

  render(): TemplateResult {
    if (this.deck) {
      return html`<div id="root" class="container">
        ${this.renderDeckCategories(this.deck)}
      </div>`;
    }

    return html`NO DECK TO VIEW`;
  }

  renderDeckCategories(deck: Deck) {
    const renderOutput: TemplateResult[] = [];

    for (const category of deck.unitCategories) {
      renderOutput.push(this.renderDeckCategory(category, deck));
    }

    return renderOutput;
  }

  renderDeckCategory(category: UnitCategory, deck: Deck) {
    const unitsInDeckCategory =
      deck.unitsInDeckGroupedUnitsByCategory[category];

    const numberOfCardsInCategory = unitsInDeckCategory.length;
    const unitsInDeckCategoryToRender: TemplateResult[] = [];

    for (const deckUnit of unitsInDeckCategory) {
      unitsInDeckCategoryToRender.push(html`<compact-armoury-card
        .deck=${deck}
        .pack=${deckUnit?.pack}
        .transport=${deckUnit?.transport}
        .selectedVeterancy=${deckUnit?.veterancy}
      ></compact-armoury-card>`);
    }

    return html`<vaadin-details ?opened=${true} class="card-section">
      <div class="category-stats" slot="summary">
        <h4>${getCodeForFactoryDescriptor(category)}</h4>
        <div class="unit-count">
          ${deck.getTotalUnitCountForCategory(category)} units
        </div>
        <div class="slot-count">
          ${numberOfCardsInCategory} /
          ${deck.getTotalSlotsForCategory(category)} slots
        </div>
        <div class="total-points-in-category">
          ${deck.getSumOfUnitCostsForCategory(category)} points
        </div>
      </div>

      <div class="armoury-category-cards">${unitsInDeckCategoryToRender}</div>
    </vaadin-details>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'summary-view': SummaryView;
  }
}
