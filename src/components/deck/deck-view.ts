import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import './deck-card';
import {Deck} from '../../classes/deck';
import {UnitCategory} from '../../types/deck-builder';
import {getCodeForFactoryDescriptor} from '../../utils/get-code-for-factory-descriptor';

@customElement('deck-view')
export class DeckView extends LitElement {
  static get styles() {
    return css`
      .deck {
        padding-left: var(--lumo-space-s);
        padding-right: var(--lumo-space-s);
      }

      h3.deck-title {
        max-width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
        margin: 0;
      }

      .deck-category-cards {
        display: flex;
        flex-direction: column;
        padding: var(--lumo-space-s);
      }

      .deck-category-headings {
        display: flex;
        flex-direction: column;
      }

      .deck-category-heading-row {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        color: var(--lumo-contrast-80pct);
      }

      .deck-category-cards > deck-card {
        margin-top: var(--lumo-space-xs);
      }
    `;
  }

  @property({
    hasChanged(_value: Deck, _oldValue: Deck) {
      return true;
    },
  })
  deck?: Deck;

  render(): TemplateResult {
    if (this.deck) {
      return html` <div class="deck">
        <div><h3 class="deck-title">Deck Name</h3></div>
        ${this.renderDeck(this.deck)}
      </div>`;
    } else {
      return html`NO DECK`;
    }
  }

  renderDeck(deck: Deck) {
    const renderOutput: TemplateResult[] = [];
    for (const category of deck.unitCategories) {
      renderOutput.push(this.renderDeckCategory(category, deck));
    }
    return html`${renderOutput}`;
  }

  renderDeckCategory(category: UnitCategory, deck: Deck) {
    const deckUnitsInCategory =
      deck.unitsInDeckGroupedUnitsByCategory[category];
    const deckUnitsInCategoryToRender: TemplateResult[] = [];

    const numberOfCardsInCategory = deckUnitsInCategory.length;

    for (const deckUnit of deckUnitsInCategory) {
      deckUnitsInCategoryToRender.push(
        html`<deck-card .deckUnit=${deckUnit} .deck=${deck}></deck-card>`
      );
    }

    return html`<div class="deck-section">
      <div class="deck-category-headings">
        <div class="deck-category-heading-row">
          <h3 class="deck-category-heading-title">
            ${getCodeForFactoryDescriptor(category)}
          </h3>
          <div>${deck.getTotalUnitCountForCategory(category)} units</div>
        </div>
        <div class="deck-category-heading-row">
          <div>
            ${numberOfCardsInCategory} /
            ${deck.getTotalSlotsForCategory(category)} slots
          </div>
          <div>
            Next slot: ${deck.getNextSlotCostForCategory(category)} points
          </div>
        </div>
      </div>
      <div class="deck-category-cards">${deckUnitsInCategoryToRender}</div>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'deck-view': DeckView;
  }
}
