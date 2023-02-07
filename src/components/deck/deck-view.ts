import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import './deck-card';
import {Deck} from '../../classes/deck';
import {UnitCategory} from '../../types/deck-builder';
import {getCodeForFactoryDescriptor} from '../../utils/get-code-for-factory-descriptor';
import {notificationService} from '../../services/notification';
import '@vaadin/menu-bar';
import '@vaadin/context-menu';
import {MenuBarItemSelectedEvent} from '@vaadin/menu-bar';
import '@vaadin/tooltip';
import {getDeckShareUrl} from '../../utils/get-deck-share-url';

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

      .slot-costs > span {
        color: var(--lumo-contrast-50pct);
      }

      .slot-costs > .in-use {
        color: var(--lumo-primary-color);
      }

      .slot-costs > .is-next {
        color: var(--lumo-contrast);
      }

      .total-unit-cost {
        border-top: 1px solid var(--lumo-contrast-20pct);
        padding: var(--lumo-space-s);
        display: flex;
        align-items: flex-end;
        justify-content: flex-end;
        color: var(--lumo-contrast);
      }

      .total-unit-cost > span.warning {
        color: orange;
      }

      .total-unit-cost > span {
        margin-left: var(--lumo-space-s);
        margin-right: var(--lumo-space-s);
      }
    `;
  }

  @property({
    hasChanged(_value: Deck, _oldValue: Deck) {
      return true;
    },
  })
  deck?: Deck;

  @property()
  showClose = false;

  async exportDeck() {
    try {
      if (this.deck) {
        const deckCode = this.deck.toDeckCode();
        await navigator.clipboard.writeText(deckCode);
        notificationService.instance?.addNotification({
          content: 'Deck code copied to clipboard',
          duration: 3000,
          theme: '',
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
    this.dispatchEvent(new CustomEvent('deck-cleared', {bubbles: true}));
    notificationService.instance?.addNotification({
      content: 'Deck cleared',
      duration: 3000,
      theme: '',
    });
  }

  async shareDeck() {
    try {
      if (this.deck) {
        const deckCode = this.deck.toDeckCode();
        await navigator.clipboard.writeText(getDeckShareUrl(deckCode));
        notificationService.instance?.addNotification({
          content: 'Share link copied to clipboard',
          duration: 3000,
          theme: '',
        });
      } else {
        throw new Error('No deck to share');
      }
    } catch (err) {
      notificationService.instance?.addNotification({
        content: 'Failed to copy share code',
        duration: 5000,
        theme: 'error',
      });
      console.error(err);
    }
  }

  menuItemSelected(item: MenuBarItemSelectedEvent) {
    const menuId = (item.detail.value.component as HTMLElement)?.getAttribute(
      'menu-id'
    );

    switch (menuId) {
      case 'export':
        this.exportDeck();
        break;
      case 'change':
        this.dispatchEvent(
          new CustomEvent('change-division-clicked', {composed: true})
        );
        break;
      case 'clear':
        this.resetDeck();
        break;
      case 'share':
        this.shareDeck();
        break;
      case 'view':
        this.dispatchEvent(
          new CustomEvent('summary-clicked', {composed: true})
        );
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

    if (isChild) {
      item.appendChild(icon);
    }
    span.appendChild(document.createTextNode(text));
    if (text) {
      item.appendChild(span);
    }

    if (!isChild) {
      item.appendChild(icon);
    }
    return item;
  }

  render(): TemplateResult {
    if (this.deck) {
      const unitCosts = this.deck.getSumOfUnitsCosts();
      const warningUpperThreshold = 14500;
      const warningLowerThreshold = 12000;

      let displayWarningOnCost = false;

      let warningText = 'Typical decks should be under 14500 points';
      if (unitCosts > warningUpperThreshold) {
        displayWarningOnCost = true;
        warningText = 'Typical decks should be under 14500 points';
      } else if (unitCosts < warningLowerThreshold) {
        displayWarningOnCost = true;
        warningText = 'Typical decks should be more than 12000 points';
      }

      return html` <div class="deck">
        <div class="deck-header">
          <div class="deck-header-row">
            <h3 class="deck-title">
              ${this.deck.division.name ?? this.deck.division.descriptor}
            </h3>
            ${this.showClose
              ? html`<vaadin-button
                  @click=${() =>
                    this.dispatchEvent(new CustomEvent('close-clicked'))}
                  theme="icon tertiary"
                  aria-label="close drawer"
                  ><vaadin-icon icon="vaadin:close"></vaadin-icon
                ></vaadin-button>`
              : html``}
          </div>

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
                  component: this.createItem(
                    'angle-down',
                    'Actions',
                    'actions'
                  ),
                  children: [
                    {
                      component: this.createItem(
                        'compile',
                        'Export to code',
                        'export',
                        true
                      ),
                    },
                    {
                      component: this.createItem(
                        'share',
                        'Share',
                        'share',
                        true
                      ),
                    },
                    {
                      component: this.createItem(
                        'eye',
                        'View deck',
                        'view',
                        true
                      ),
                    },
                    {component: 'hr'},
                    {
                      component: this.createItem(
                        'exchange',
                        'Change division',
                        'change',
                        true
                      ),
                    },
                    {
                      component: this.createItem(
                        'trash',
                        'Clear',
                        'clear',
                        true
                      ),
                    },
                  ],
                },
              ]}"
            ></vaadin-menu-bar>
          </div>
        </div>
        <div class="deck-card-categories">${this.renderDeck(this.deck)}</div>
        <div class="total-unit-cost">
          Total Points:
          <span class="${displayWarningOnCost && 'warning'}">${unitCosts}</span>
          ${displayWarningOnCost
            ? html`<vaadin-icon
                  id="warning-icon"
                  icon="vaadin:question-circle-o"
                  style="font-size: 12px"
                ></vaadin-icon
                ><vaadin-tooltip
                  for="warning-icon"
                  text=${warningText}
                  position="top-end"
                ></vaadin-tooltip>`
            : html``}
        </div>
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

  renderSlotCosts(slotCosts: number[], nextSlotIndex: number) {
    return html`<div class="slot-costs">
      [${slotCosts.map((el, index) => {
        const isLast = index !== slotCosts.length - 1;
        let isNext = false;
        let isInUse = false;

        if (index === nextSlotIndex) {
          isNext = true;
        } else if (index < nextSlotIndex) {
          isInUse = true;
        }

        return html`<span
            class="${isInUse ? 'in-use' : ''} ${isNext ? 'is-next' : ''}"
            >${el}</span
          >
          ${isLast ? ', ' : ''}`;
      })}]
    </div> `;
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
          <div class="total-points-in-category">
            ${deck.getSumOfUnitCostsForCategory(category)} points
          </div>
        </div>
        <div class="deck-category-heading-row">
          ${this.renderSlotCosts(
            this.deck?.slotCosts[category] || [],
            this.deck?.getNextSlotCostIndexForCategory(category) || 0
          )}
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
