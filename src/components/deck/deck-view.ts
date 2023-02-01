import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import './deck-card';
import {Deck} from '../../classes/deck';
import { UnitCategory } from '../../types/deck-builder';
import { getCodeForFactoryDescriptor } from '../../utils/get-code-for-factory-descriptor';

@customElement('deck-view')
export class DeckView extends LitElement {
  static get styles() {
    return css`
      h3.deck-title {
        max-width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
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

  @property()
  deck?: Deck;

  /*
   removePackFromDeck(packConfig: SelectedPackConfig) {
    const deckWithoutPack = this.builtDeck.filter(
      (config) => packConfig.id !== config.id
    );
    this.builtDeck = [...deckWithoutPack];
  }
  */

  render(): TemplateResult {
    if (this.deck) {
      return html` <div class="deck">
        <h3 class="deck-title">Deck Name</h3>
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
    return html`DECK`;
  }

  renderDeckCategory(category: UnitCategory, deck: Deck) {
    const deckUnitsInCategory =
      deck.unitsInDeckGroupedUnitsByCategory[category];
    const deckUnitsInCategoryToRender: TemplateResult[] = [];

    // const totalUnitsInCategory = deckUnitsInCategory.length;
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
            ${numberOfCardsInCategory} / ${deck.getTotalSlotsForCategory(category)} slots
          </div>
          <div>
            Next slot: ${deck.getNextSlotCostForCategory(category)} points
          </div>
        </div>
      </div>
      <div class="deck-category-cards">${deckUnitsInCategoryToRender}</div>
    </div>`;
  }

  /*
  renderDeck(groupedDeck: GroupedPackConfigs): TemplateResult[] {
    const renderOutput: TemplateResult[] = [];
    if (this.division?.costMatrix?.matrix) {
      for (const matrixRow of this.division?.costMatrix?.matrix) {
        if (!deckCategoryIsDeprecated(matrixRow.name)) {
          renderOutput.push(
            this.renderDeckCategory(matrixRow, groupedDeck[matrixRow.name])
          );
        }
      }
    }

    return renderOutput;
  }
  */

  /*
  renderDeckCategory(
    matrixRow: MatrixRow,
    groupedUnits: SelectedPackConfig[]
  ): TemplateResult {
    let totalUnitsInCategory = 0;

    const deckCards: TemplateResult[] = [];
    for (const config of groupedUnits) {
      const veterancies = getQuantitiesForUnitVeterancies({
        defaultUnitQuantity: config.pack.numberOfUnitsInPack,
        unitQuantityMultipliers: config.pack.numberOfUnitInPackXPMultiplier,
      });

      totalUnitsInCategory += veterancies[config.veterancy];

      deckCards.push(
        html`<deck-card
          .packConfig=${config}
          @pack-config-removed=${this.packConfigRemoved}
          .unitMap=${this.unitMap}
        ></deck-card>`
      );
    }
    return html`<div class="deck-section">
      <div class="deck-category-headings">
        <div class="deck-category-heading-row">
          <h3 class="deck-category-heading-title">
            ${getCodeForFactoryDescriptor(matrixRow.name)}
          </h3>
          <div>${totalUnitsInCategory} units</div>
        </div>
        <div class="deck-category-heading-row">
          <div>
            ${groupedUnits.length} / ${matrixRow.activationCosts.length} slots
          </div>
          <div>
            Next slot: ${matrixRow.activationCosts[groupedUnits.length]} points
          </div>
        </div>
      </div>
      <div class="deck-category-cards">${deckCards}</div>
    </div>`;
  }
  */
}

declare global {
  interface HTMLElementTagNameMap {
    'deck-view': DeckView;
  }
}
