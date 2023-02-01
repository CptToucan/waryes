import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import './pack-armoury-card';

import {Deck} from '../../classes/deck';
import { UnitCategory } from '../../types/deck-builder';
import {getCodeForFactoryDescriptor} from '../../utils/get-code-for-factory-descriptor';

@customElement('armoury-view')
export class ArmouryView extends LitElement {
  static get styles() {
    return css`

      .armoury-category-cards {
        display: grid;
        padding: var(--lumo-space-s);
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: var(--lumo-space-xs);
      }

      .card-section h3 {
        padding-left: var(--lumo-space-s);
        padding-right: var(--lumo-space-s);
        color: var(--lumo-contrast-90pct);
      }
    `;
  }

  @property()
  deck?: Deck;

  render(): TemplateResult {
    if (this.deck) {
      return html`${this.renderCardCategories(this.deck)}`;
    } else {
      return html`NO DECK`;
    }
  }

  /**
   * Render the groups of the armoury card categories
   * @param deck
   */

  renderCardCategories(deck: Deck) {
    const renderOutput: TemplateResult[] = [];

    for (const category of deck.unitCategories) {
      renderOutput.push(this.renderCardCategory(category, deck));
    }
    return renderOutput;
  }

  renderCardCategory(category: UnitCategory, deck: Deck) {
    const unitPacksInCategory = deck.availableUnits[category];

    const unitPacksInCategoryRender: TemplateResult[] = [];
    for (const unitPack of unitPacksInCategory) {
      unitPacksInCategoryRender.push(
        html`<pack-armoury-card
          .pack=${unitPack}
          .deck=${this.deck}
        ></pack-armoury-card>`
      );
    }

    return html`<div class="card-section">
      <div>
        <h3>${getCodeForFactoryDescriptor(category)}</h3>
      </div>

      <div class="armoury-category-cards">${unitPacksInCategoryRender}</div>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'armoury-view': ArmouryView;
  }
}
