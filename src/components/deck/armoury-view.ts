import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import './pack-armoury-card';

import {Deck} from '../../classes/deck';
import {UnitCategory} from '../../types/deck-builder';
import {getCodeForFactoryDescriptor} from '../../utils/get-code-for-factory-descriptor';

@customElement('armoury-view')
export class ArmouryView extends LitElement {
  static get styles() {
    return css`
      h2,
      h3 {
        margin: 0;
      }

      .armoury-category-cards {
        display: grid;
        place-items: center;
        padding: var(--lumo-space-s);
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: var(--lumo-space-xs);
      }

      .card-section h2 {
        padding-left: var(--lumo-space-s);
        padding-right: var(--lumo-space-s);
        color: var(--lumo-contrast-90pct);
        margin: 0;
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
        <h2 class="category">${getCodeForFactoryDescriptor(category)}</h2>
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
