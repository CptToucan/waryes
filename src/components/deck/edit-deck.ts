import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property, query, state} from 'lit/decorators.js';
import {Deck} from '../../classes/deck';
import './armoury-view';
import './deck-view';
import 'side-drawer';
import {DeckController} from '../../controllers/deck-controller';
import {SideDrawer} from 'side-drawer';
import {UnitCategory} from '../../types/deck-builder';
import {MenuBarItemSelectedEvent} from '@vaadin/menu-bar';

const SYNC_ARMOURY_TEXT = 'Sync collapsed areas with armoury';

@customElement('edit-deck')
export class EditDeck extends LitElement {
  static get styles() {
    return css`
      .filters {
        grid-area: filters;
        border-left: 1px solid var(--lumo-contrast-10pct);
        padding: var(--lumo-space-s);
      }

      h3 {
        margin: 0;
      }

      .deck-category-heading-title {
        color: var(--lumo-primary-color-50pct);
        text-transform: uppercase;
      }

      side-drawer {
        background-color: var(--lumo-base-color);
        max-width: 95vw;
      }

      side-drawer > .deck {
        height: 100%;
        overflow: auto;
      }

      :host {
        display: flex;
        flex: 0 0 100%;
        height: 100%;
      }
      .container {
        flex: 1 1 0;
        max-height: 100%;
        padding-bottom: var(--lumo-space-s);

        overflow: hidden;
      }

      .cards {
        height: 100%;
        overflow-y: scroll;
        position: relative;
      }

      .desktop {
        display: flex;
        flex-direction: row;
        height: 100%;
      }

      .desktop > .cards {
        flex: 1 1 80%;
      }

      .desktop > deck-view {
        flex: 1 0 20%;
        height: 100%;
        overflow-y: auto;
        min-width: 300px;
        border-right: 1px solid var(--lumo-contrast-20pct);
      }

      .button-toolbar {
        display: flex;
        justify-content: flex-end;
        padding: var(--lumo-space-s);
      }

      .button-drawer {
        position: fixed;
        bottom: 0;
        height: 60px;
        width: 100%;
        background-color: var(--lumo-base-color);
        z-index: 1;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-top: 1px solid var(--lumo-contrast-20pct);
      }

      .button-drawer > vaadin-button {
        flex: 1 1 100%;
        margin-left: var(--lumo-space-s);
        margin-right: var(--lumo-space-s);
      }

      @media only screen and (min-width: 701px) {
        .button-drawer {
          display: none;
        }
      }

      @media only screen and (max-width: 700px) {
        .desktop > deck-view {
          display: none;
        }
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
  userDeckId?: string;

  @state()
  deckOpen = false;

  @query('side-drawer')
  drawer!: SideDrawer;

  @state()
  openAreas: {
    [key in UnitCategory]?: boolean;
  } = {
    [UnitCategory.AA]: true,
    [UnitCategory.ART]: true,
    [UnitCategory.AIR]: true,
    [UnitCategory.INF]: true,
    [UnitCategory.HEL]: true,
    [UnitCategory.LOG]: true,
    [UnitCategory.REC]: true,
    [UnitCategory.TNK]: true,
  };

  @state()
  syncDeckViewWithArmoury = false;

  syncDeckWithArmoury(openAreas: {[key in UnitCategory]?: boolean}) {
    this.openAreas = {...openAreas};
  }

  @state()
  showUnitTraits = false;

  openDeck() {
    this.deckOpen = true;
    this.drawer.open = true;
  }

  closeDeck() {
    this.deckOpen = false;
    this.drawer.open = false;
  }

  constructor() {
    super();
    this.deckController = new DeckController(this);
  }

  deckController?: DeckController;

  firstUpdated() {
    if (this.deck !== undefined && this.deckController) {
      this.deckController.initialiseControllerAgainstDeck(this.deck);
    }
  }

  get tooltipItems() {
    const childTooltipItems = [];

    childTooltipItems.push({
      text: SYNC_ARMOURY_TEXT,
      checked: this.syncDeckViewWithArmoury,
    });

    return [
      {
        text: 'Options',
        children: childTooltipItems,
      },
    ];
  }

  render(): TemplateResult {
    return html`
      <div class="container">
        <side-drawer
          @open=${() => this.openDeck()}
          @close=${() => this.closeDeck()}
          ?open=${this.deckOpen}
        >
          <deck-view
            .deck=${this.deck}
            .showClose=${true}
            .userDeckId=${this.userDeckId}
            @close-clicked=${() => this.closeDeck()}
            @deck-cleared=${() =>
              this.dispatchEvent(
                new CustomEvent('deck-cleared', {bubbles: true})
              )}
          ></deck-view>
        </side-drawer>
        <div class="desktop">
          <deck-view
            .deck=${this.deck}
            .userDeckId=${this.userDeckId}
            @open-areas-changed=${(event: CustomEvent) => {
              if(this.syncDeckViewWithArmoury) {
                this.syncDeckWithArmoury(event.detail.openAreas);
              }
            }}
            @deck-cleared=${() =>
              this.dispatchEvent(
                new CustomEvent('deck-cleared', {bubbles: true})
              )}
          ></deck-view>

          <div class="cards">
            <div class="button-toolbar">
              <vaadin-menu-bar
                theme=""
                .items="${this.tooltipItems}"
                @item-selected=${(event: MenuBarItemSelectedEvent) => {
                  const item = event.detail.value;
                  if (item.text === SYNC_ARMOURY_TEXT) {
                    this.syncDeckViewWithArmoury =
                      !this.syncDeckViewWithArmoury;

                    this.syncDeckWithArmoury({
                      [UnitCategory.AA]: true,
                      [UnitCategory.ART]: true,
                      [UnitCategory.AIR]: true,
                      [UnitCategory.INF]: true,
                      [UnitCategory.HEL]: true,
                      [UnitCategory.LOG]: true,
                      [UnitCategory.REC]: true,
                      [UnitCategory.TNK]: true,
                    });
                  }
                }}
              ></vaadin-menu-bar>
            </div>
            <div class="button-drawer">
              <vaadin-button
                @click=${() => this.openDeck()}
                theme="large primary"
                >View Deck</vaadin-button
              >
            </div>

            <armoury-view
              .deck=${this.deck}
              .visibleAreas=${this.openAreas}
            ></armoury-view>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'edit-deck': EditDeck;
  }
}
