import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {Deck} from '../../classes/deck';
import {UnitCategory} from '../../types/deck-builder';
import {getCodeForFactoryDescriptor} from '../../utils/get-code-for-factory-descriptor';
import './display-armoury-with-transport-card';

@customElement('summary-view')
export class SummaryView extends LitElement {
  static get styles() {
    return css`
      :host {
        display: flex;
        flex-direction: column;
        width: 100%;
      }

      .container {
        display: flex;
        flex-direction: column;
        padding: var(--lumo-space-s);
      }

      .title-row {
        display: flex;
        flex-direction: row;
        align-items: center;
        flex-wrap: wrap;
      }

      .header {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        font-size: 16px;
        border-bottom: 1px solid var(--lumo-contrast-30pct);
        padding-bottom: var(--lumo-space-xs);
      }

      .title-column {
        display: flex;
        flex-direction: column;
      }

      .title-row > * {
        font-size: 16px;
      }

      .top-row,
      .bottom-row {
        display: flex;
        align-items: center;
      }

      .top-row {
        padding-top: var(--lumo-space-xs);
        padding-bottom: var(--lumo-space-xs);
      }

      .bottom-row {
        color: var(--lumo-contrast-70pct);
      }

      .bottom-row > *:first-child {
        margin-right: var(--lumo-space-m);
      }

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
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
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
      }

      vaadin-details::part(summary) {
        padding: 0;
      }
      vaadin-details::part(content) {
        padding: 0;
      }
    `;
  }

  @property()
  deck?: Deck;

  render(): TemplateResult {
    if (this.deck) {
      return html`<div class="container">
        <div class="header">
          <div class="title-row">
            <division-flag .division=${this.deck.division}></division-flag>
            <div class="title-column">
              <div class="top-row">
                <h3 class="division-title">
                  ${this.deck.division.name ?? this.deck.division.descriptor}
                </h3>
                <country-flag
                  .country=${this.deck.division.country}
                ></country-flag>
              </div>
              <div class="bottom-row">
                <span class="activation-points">
                  ${this.deck.totalSpentActivationPoints} /
                  ${this.deck.division.maxActivationPoints} Activation Points
                </span>
                <div class="total-unit-cost">
                  ${this.deck.getSumOfUnitsCosts()} points
                </div>
              </div>
            </div>
          </div>
          <div
            style="display: flex; justify-content: flex-end; align-items: flex-end; flex: 1 1 0;"
          >
            <vaadin-button
              theme="primary"
              @click=${() =>
                this.dispatchEvent(new CustomEvent('edit-clicked'))}
              >Edit</vaadin-button
            >
          </div>
        </div>
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
      unitsInDeckCategoryToRender.push(html`<display-armoury-with-transport-card
        .deck=${deck}
        .pack=${deckUnit?.pack}
        .transport=${deckUnit?.transport}
        .selectedVeterancy=${deckUnit?.veterancy}
      ></display-armoury-with-transport-card>`);
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
