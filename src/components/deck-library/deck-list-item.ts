import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import '@vaadin/details';
import '../division-flag';
import '../country-flag';
import '../simple-chip';
import '../deck/summary-view';
import {DivisionsMap} from '../../types/deck-builder';
import {UnitMap} from '../../types/unit';
import {Deck} from '../../classes/deck';
import {QueryDocumentSnapshot, DocumentData} from 'firebase/firestore';

@customElement('deck-list-item')
export class DeckListItem extends LitElement {
  static get styles() {
    return css`
      .deck {
        display: flex;
        flex-direction: column;

        background-color: var(--lumo-contrast-10pct);
        border-radius: var(--lumo-border-radius-m);
        padding: var(--lumo-space-s);
      }

      a {
        --lumo-button-size: var(--lumo-size-s);
        border-radius: var(--lumo-border-radius-m);
        background-color: var(--lumo-contrast-5pct);
        color: var(--lumo-primary-color);
        display: flex;
        align-items: center;
        justify-content: flex-start;
        flex-direction: row;
        height: var(--lumo-button-size);
        font-size: var(--lumo-font-size-s);
        padding: 0
          calc(var(--lumo-button-size) / 3 + var(--lumo-border-radius-m) / 2);
        text-align: center;
        text-decoration: none;
        user-select: none;
      }

      .name {
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
      }

      .left {
        display: flex;
        flex: 1 1 100%;
        overflow: hidden;
      }

      .right {
        display: flex;
      }

      .votes {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        font-size: var(--lumo-font-size-s);
        padding-left: var(--lumo-space-xs);
        padding-right: var(--lumo-space-xs);
      }

      vaadin-details {
        // width: 100%;
        flex: 1 1 100%;
      }
      vaadin-details-summary {
        display: flex;
        flex-direction: row;
        gap: var(--lumo-space-s);
      }

      vaadin-button {
        margin: 0;
      }

      .main-details {
        display: flex;
        flex-direction: column;
        justify-content: center;
        flex: 1 1 100%;
        min-height: calc(var(--lumo-space-xl) * 1.5);
        overflow: hidden;
      }

      .details {
        display: flex;
        align-items: center;
        gap: var(--lumo-space-s);
      }

      .summary-icons {
        display: flex;
        flex-direction: row;
        height: 20px;
        gap: var(--lumo-space-s);
      }

      .summary-icons > * {
        width: 20px;
      }

      .headline-container {
        display: flex;
        gap: var(--lumo-space-s);
        justify-content: space-between;
        position: relative;
      }

      .time {
        position: absolute;
        right: 0;
        bottom: 0;
        font-size: 10px;
        color: var(--lumo-contrast-60pct);
      }

      .button-container {
        display: flex;
        gap: var(--lumo-space-s);
      }

      .summary {
        display: flex;
        overflow-y: auto;
        flex: 1 1 100%;
        // height: 500px;
      }

      .pro {
        --background: var(--lumo-secondary-color-10pct);
        --color: var(--lumo-secondary-color);
        width: 35px;
        min-width: 35px;
      }

      simple-chip {
        height: 16px;
        font-size: var(--lumo-font-size-xs);
      }

      .deck-title {
        display: flex;
        flex-direction: row;
        align-items: center;
        column-gap: var(--lumo-space-s);
      }

      .tags {
        display: flex;
        flex-direction: row;
        gap: var(--lumo-space-xs);
      }

      summary-view {
        flex: 1 1 100%;
      }

      @media (max-width: 640px) {
        .desktop-only {
          display: none;
        }
      }
    `;
  }

  @property({
    hasChanged() {
      return true;
    },
  })
  deck?: QueryDocumentSnapshot<DocumentData>;

  @property()
  divisionsMap?: DivisionsMap;

  @property()
  unitMap?: UnitMap;

  @state()
  private _expanded = false;

  @property()
  hideVotes = false;

  @state()
  get voteCount(): number {
    return this.deck?.data()?.vote_count || 0;
  }

  render(): TemplateResult {
    if (!this.deck) return html``;

    const deck = this.deck?.data();
    const unitMap = this.unitMap;
    const divisionsMap = this.divisionsMap;

    if (!unitMap) return html``;
    if (!divisionsMap) return html``;

    const availableDivisions = Object.values(divisionsMap);

    const deckFromString = Deck.fromDeckCode(deck.code, {
      unitMap: unitMap,
      divisions: availableDivisions,
    });

    // Only show the vote button if user is authenticated
    return html`
      <div class="deck">
        <div class="headline-container">
          <div class="time">
            ${this.deck.data().created.toDate().toLocaleString()}
          </div>
          <div class="left">
            ${!this.hideVotes
              ? html`<div class="votes">${this.voteCount}</div>`
              : ''}

            <div class="main-details">
              <div class="deck-title">
                ${deck.is_pro_deck
                  ? html`<simple-chip class="pro">PRO</simple-chip>`
                  : ''}
                <slot name="name">
                  <span class="name"> ${deck.name}</span></slot
                >

              </div>
              <div class="details">
                <div class="summary-icons">
                  <division-flag
                    .division=${{
                      id: 1,
                      name: deck.division,
                      descriptor: deck.division,
                    }}
                  ></division-flag>
                  <country-flag .country=${deck.country}></country-flag>
                </div>
                <div class="tags">
                  ${(deck.tags as string[]).map(
                    (tag) => html`<simple-chip>${tag}</simple-chip>`
                  )}
                </div>
              </div>
            </div>
          </div>
          <div class="right">
            <div class="button-container">
              <a class="inspect" href="/deck/${this.deck?.id}">
                <vaadin-icon icon="waryes:recon"></vaadin-icon>
                <span
                  class="desktop-only"
                  style="margin-left: var(--lumo-space-xs);"
                  >Intel</span
                >
              </a>
              <slot name="buttons"></slot>
              <vaadin-button
                theme="small icon"
                @click=${() => {
                  this._expanded = !this._expanded;
                }}
              >
                <vaadin-icon
                  icon=${this._expanded
                    ? 'vaadin:caret-up'
                    : 'vaadin:caret-down'}
                ></vaadin-icon>
              </vaadin-button>
            </div>
          </div>
        </div>
        ${this._expanded
          ? html` <div class="summary">
              <summary-view .deck=${deckFromString}></summary-view>
            </div>`
          : ''}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'deck-list-item': DeckListItem;
  }
}
