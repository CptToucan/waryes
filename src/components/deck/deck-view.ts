import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import './deck-card';
import {Deck} from '../../classes/deck';
import {UnitCategory} from '../../types/deck-builder';
import {getCodeForFactoryDescriptor} from '../../utils/get-code-for-factory-descriptor';
import {notificationService} from '../../services/notification';
import '@vaadin/menu-bar';
import '@vaadin/context-menu';
import { MenuBarItemSelectedEvent } from '@vaadin/menu-bar';

@customElement('deck-view')
export class DeckView extends LitElement {
  static get styles() {
    return css`
      .deck {
        height: 100%;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }

      h3.deck-title {
        overflow: hidden;
        text-overflow: ellipsis;
        margin: 0;
      }

      h3 {
        margin: 0;
      }

      .deck-header {
        border-bottom: 1px solid var(--lumo-contrast-20pct);
        padding-top: var(--lumo-space-s);
        padding-bottom: var(--lumo-space-s);
        padding-left: var(--lumo-space-s);
        padding-right: var(--lumo-space-s);
      }

      .deck-category-cards {
        display: flex;
        flex-direction: column;
      }

      .deck-header-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .deck-category-headings {
        display: flex;
        flex-direction: column;
        width: 100%;
        flex: 1 1 0;
      }

      .activation-points {
        color: var(--lumo-contrast-80pct);
        display: flex;
        justify-content: flex-end;
      }

      vaadin-details::part(summary-content) {
        width: 100%;
      }

      .deck-card-categories {
        flex: 1 1 100%;
        overflow-y: auto;
        padding-left: var(--lumo-space-s);
        padding-right: var(--lumo-space-s);
      }

      .category-empty-state {
        color: var(--lumo-contrast-60pct);
        text-align: center;
      }

      .deck-category-heading-title {
        color: var(--lumo-contrast);
      }

      .deck-category-heading-row {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        color: var(--lumo-contrast-80pct);
        font-size: var(--lumo-font-size-m);
      }

      .deck-category-cards > deck-card {
        margin-top: var(--lumo-space-xs);
      }

      vaadin-menu-bar::part(container) {
        
      }
    `;
  }

  @property({
    hasChanged(_value: Deck, _oldValue: Deck) {
      return true;
    },
  })
  deck?: Deck;

  async exportDeck() {
    try {
      if (this.deck) {
        const deckCode = this.deck.toDeckCode();
        await navigator.clipboard.writeText(deckCode);
        notificationService.instance?.addNotification({
          content: 'Deck code copied to clipboard',
          duration: 3000,
          theme: 'primary',
        });
        return;
      } else {
        throw new Error('No deck to export');
      }
    } catch (err) {
      notificationService.instance?.addNotification({
        content: 'Failed to generate deck code',
        duration: 5000,
        theme: 'error',
      });
      console.error(err);
    }
  }

  resetDeck() {
    this.deck?.clearDeck();
    this.dispatchEvent(new CustomEvent("deck-cleared", {bubbles: true}))
  }

  menuItemSelected(item: MenuBarItemSelectedEvent) {
    const menuId = (item.detail.value.component as HTMLElement)?.getAttribute("menu-id");

    switch(menuId) {
      case "export":
        this.exportDeck();
        break;
      case "clear":
        this.resetDeck();
        break;
    }
  }

  createItem(iconName: string, text: string, id: string, isChild = false) {
    const item = document.createElement('vaadin-context-menu-item');
    const span = document.createElement('span');
    const icon = document.createElement('vaadin-icon');

    if (isChild) {
      icon.style.width = 'var(--lumo-icon-size-s)';
      icon.style.height = 'var(--lumo-icon-size-s)';
      icon.style.marginRight = 'var(--lumo-space-s)';
      span.style.color = 'var(--lumo-contrast)';
      span.style.paddingTop = '10px';
      icon.style.color = 'var(--lumo-primary-color)';
      item.style.display = 'flex';
      item.style.alignItems = 'center';
      item.style.justifyContent = 'center';
    }

    item.style.display = 'flex';
    item.style.alignItems = 'center';
    


    icon.setAttribute('icon', `vaadin:${iconName}`);
    item.setAttribute('menu-id', id);

    if(isChild) {
      item.appendChild(icon);
    }
    span.appendChild(document.createTextNode(text))
    if (text) {
      item.appendChild(span);
    }

    if(!isChild) {
      item.appendChild(icon);
    }
    return item;
  }

  render(): TemplateResult {
    if (this.deck) {
      return html` <div class="deck">
        <div class="deck-header">
          <h3 class="deck-title">${this.deck.division.descriptor}</h3>
          <div class="deck-header-row">
            <span class="activation-points">
              ${this.deck.totalSpentActivationPoints} /
              ${this.deck.division.maxActivationPoints} Activation Points
            </span>

            <vaadin-menu-bar
              theme="primary icon"
              @item-selected=${this.menuItemSelected}
              .items="${[
                {
                  component: this.createItem('angle-down', 'Actions', 'actions'),
                  children: [
                    {
                      component: this.createItem(
                        'compile',
                        'Export',
                        'export',
                        true
                      ),
                    },
                    { component: 'hr' },
                    {component: this.createItem('trash', 'Clear', 'clear', true)},
                  ],
                },
              ]}"
            ></vaadin-menu-bar>
          </div>
        </div>
        <div class="deck-card-categories">${this.renderDeck(this.deck)}</div>
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

    return html`<vaadin-details ?opened=${true} class="deck-section">
      <div class="deck-category-headings" slot="summary">
        <div class="deck-category-heading-row">
          <h3 class="deck-category-heading-title">
            ${getCodeForFactoryDescriptor(category)}
          </h3>
          <div class="unit-count">
            ${deck.getTotalUnitCountForCategory(category)} units
          </div>
        </div>
        <div class="deck-category-heading-row">
          <div class="slot-count">
            ${numberOfCardsInCategory} /
            ${deck.getTotalSlotsForCategory(category)} slots
          </div>
          <div class="next-slot-cost">
            Next slot: ${deck.getNextSlotCostForCategory(category)} points
          </div>
        </div>
      </div>
      <div class="deck-category-cards">
        ${deckUnitsInCategoryToRender.length > 0
          ? deckUnitsInCategoryToRender
          : html`<span class="category-empty-state"
              >No cards in category</span
            >`}
      </div>
    </vaadin-details>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'deck-view': DeckView;
  }
}
