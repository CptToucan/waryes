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
import "@vaadin/tooltip";

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
        height: 30px;
        align-items: center;
      }

      .summary {
        display: flex;
        flex-direction: column;
        overflow-y: auto;
        flex: 1 1 100%;
      }

      .embed-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding-top: var(--lumo-space-s);
        padding-bottom: var(--lumo-space-s);
      }

      .pro {
        --background: var(--lumo-secondary-color-10pct);
        --color: var(--lumo-secondary-color);
        width: 35px;
        min-width: 35px;
        text-align: center;
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
  deck?: any;

  @property()
  divisionsMap?: DivisionsMap;

  @property()
  unitMap?: UnitMap;

  @state()
  private _expanded = false;

  @property()
  isOutdated = false;


  render(): TemplateResult {
    if (!this.deck) return html``;

    const deck = this.deck;
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
            ${new Date(this.deck?.updatedAt).toLocaleString()}
          </div>
          <div class="left">
            <div class="main-details">
              <div class="deck-title">
                ${deck.isPro
                  ? html`<simple-chip class="pro">PRO</simple-chip>`
                  : ''}
                ${deck.isContentCreator
                  ? html`<simple-chip class="pro">CC</simple-chip>`
                  : ''}
                <slot name="name"> <div class="name">${deck.name}</div></slot>
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
                  ${(deck.tags as string[] || []).map(
                    (tag) => html`<simple-chip>${tag}</simple-chip>`
                  )}
                </div>
              </div>
            </div>
          </div>
          <div class="right">
            <div class="button-container">
              ${this.isOutdated
                ? html` <vaadin-icon id="warning-icon" icon="vaadin:warning">
                    </vaadin-icon
                    ><vaadin-tooltip
                      for="warning-icon"
                      text=${"This deck hasn't been updated since the last patch and might not work anymore."}
                      position="top-end"
                    ></vaadin-tooltip>`
                : ''}
              ${deck.youtubeLink
                ? html` <vaadin-icon id="youtube-icon" icon="vaadin:youtube">
                    </vaadin-icon>
                    <vaadin-tooltip
                      for="youtube-icon"
                      text=${'This deck has a YouTube video associated with it.'}
                      position="top-end"
                    ></vaadin-tooltip>`
                : html``}

              <a class="inspect" href="/deck/${this.deck?.id}">
                <vaadin-icon icon="waryes:recon"></vaadin-icon>
                <div
                  class="desktop-only"
                  style="margin-left: var(--lumo-space-xs);"
                >
                  Intel
                </div>
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
              ${deck.youtubeLink
                ? this.renderEmbed(deck.youtubeLink)
                : html``}
              <summary-view .deck=${deckFromString}></summary-view>
            </div>`
          : ''}
      </div>
    `;
  }

  renderEmbed(link: string) {
    return html`<div class="embed-container">
      <iframe
        width="340"
        height="191"
        src=${link}
        frameborder="0"
        allow="autoplay;picture-in-picture"
      ></iframe>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'deck-list-item': DeckListItem;
  }
}
