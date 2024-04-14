import { User } from 'firebase/auth';
import {
  DocumentData,
} from 'firebase/firestore';
import { css, html, LitElement, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { FirebaseService } from '../services/firebase';
import '../components/deck-library/deck-list-item';
import { TextFieldValueChangedEvent } from '@vaadin/text-field';
import { Router } from '@vaadin/router';
import '@vaadin/confirm-dialog';
import { ConfirmDialogOpenedChangedEvent } from '@vaadin/confirm-dialog';
import { notificationService } from '../services/notification';
import { DeckDatabaseAdapter, DeckRecord } from '../classes/DeckDatabaseAdapter';
import { LoadUnitsAndDivisionsMixin } from '../mixins/load-units-and-divisions';

interface DecksByDivision {
  [key: string]: DeckRecord[];
}

@customElement('my-decks-route')
export class MyDecksRoute extends LoadUnitsAndDivisionsMixin(LitElement) {
  static get styles() {
    return css`
      :host {
        display: flex;
        justify-content: center;
        padding: var(--lumo-space-s);
      }

      .page {
        display: flex;
        flex-direction: column;
        justify-content: center;
        // margin: 0 auto; /* Center the container horizontally */
        background-color: var(--lumo-contrast-5pct);
        border-radius: var(--lumo-border-radius);
        padding: var(--lumo-space-s);

        width: 100%;
      }

      h2 {
        margin: 0;
      }

      vaadin-button {
        margin: 0;
      }

      vaadin-text-field {
        flex: 1 1 100%;
      }

      .division-title {
        display: flex;
        gap: var(--lumo-space-m);
      }

      .categories {
        display: grid;
        padding: var(--lumo-space-xs);
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: var(--lumo-space-m);
      }

      .division {
        grid-column: span 3;
        gap: var(--lumo-space-s);
        display: flex;
        flex-direction: column;
        max-width: 100%;
        overflow-x: auto;
      }

      @media screen and (max-width: 768px) {
        .categories {
          grid-template-columns: 1fr;
        }

        .division {
          grid-column: 1;
        }
      }
    `;
  }

  loggedInUser: User | null | undefined;

  userRecordData?: DocumentData | null;

  @property()
  decks: DocumentData[] | null = null;

  @property({ type: Object })
  decksByDivision?: DecksByDivision;

  @property()
  deckNames?: {
    [key: string]: string;
  };

  @property()
  editStates?: {
    [key: string]: boolean;
  };

  @property()
  nameStates?: {
    [key: string]: string;
  };

  @state()
  deckToDelete: DeckRecord | null = null;

  @state()
  private numberOfDecks = 0;

  @state()
  private totalAllowedDecks = 0;


  async onBeforeEnter() {
    FirebaseService.auth?.onAuthStateChanged(async (user) => {
      try {
        this.loggedInUser = user;
        await this.loadUserDecks();

      } catch (error) {
        console.error(error);
      }
    });

    await this.loadUnitsAndDivisions();

  }

  private async loadUserDecks() {
    const response = await DeckDatabaseAdapter.getUserDecks();
    this.totalAllowedDecks = response.meta.totalAllowedDecks;
    this.numberOfDecks = response.meta.totalDecks;

    const decksByDivision: DecksByDivision = {};
    for (const deck of response.data) {
      const division = deck.division;
      if (!decksByDivision[division]) {
        decksByDivision[division] = [];
      }
      decksByDivision[division].push(deck);
    }

    this.decksByDivision = decksByDivision;
  }

  async saveDeckName(_deckId: number, _name = '') {
    // Saves the deck name to the user's deck names

    await DeckDatabaseAdapter.updateDeck(_deckId, {
      name: _name,
    });

    this.nameStates = {
      ...this.nameStates,
      [_deckId]: _name,
    };

    this.editStates = {
      ...this.editStates,
      [_deckId]: false,
    };
  }

  editDeckName(deckId: number) {
    this.editStates = {
      ...this.editStates,
      [deckId]: true,
    };
  }

  /**
   * Deletes the deck from firebase
   * @param deckId
   * @returns
   */
  async deleteDeck(_deckId: number) {
    try {
      await DeckDatabaseAdapter.deleteDeck(_deckId);
      await this.loadUserDecks();

      notificationService.instance?.addNotification({
        duration: 3000,
        content: 'Deck deleted',
        theme: '',
      });
    }
    catch (err) {
      console.error(err);
      notificationService.instance?.addNotification({
        duration: 3000,
        content: 'Error deleting deck',
        theme: 'error',
      });
    }
  }

  render(): TemplateResult {
    if (this.loggedInUser == null) {
      return html`
        <div class="page">You must be logged in to view this page.</div>
      `;
    }

    if (!this.decksByDivision) {
      return html` <div class="page">Loading...</div> `;
    }

    const divisionKeys = Object.keys(this.decksByDivision);

    return html`
      <div class="page">
        <h2>My Decks ${this.numberOfDecks}/${this.totalAllowedDecks}</h2>
        <div
          >Changed deck names will only be visible to you for organisation
          purposes, this is to prevent abuse.</div>
        <div class="categories">
          ${divisionKeys.length === 0
        ? html`<div style="margin: var(--lumo-space-l);">
                No decks found, create one here:
                <vaadin-button
                  theme="primary"
                  @click=${() => {
            Router.go('/deck-builder');
          }}
                  >Build deck</vaadin-button
                >
              </div>`
        : ''}
          ${divisionKeys.map((divisionDescriptor) => {
          const division = this.divisionsMap?.[divisionDescriptor];

          return html`
              <div class="division">
                <div class="division-title">
                  <division-flag .division=${division}></division-flag>
                  <h3>${division?.name}</h3>
                </div>

                ${this.decksByDivision?.[divisionDescriptor].map((deck) => {
            const name = this.deckNames?.[deck.id] || deck.privateName;

            return html`
                    <deck-list-item
                      .deck=${deck}
                      .unitMap=${this.unitMap}
                      .divisionsMap=${this.divisionsMap}
                    >
                      <div
                        slot="name"
                        style="width: 100%; display: flex; gap: var(--lumo-space-s); align-items: center;"
                      >
                        ${this.editStates?.[deck.id]
                ? html`<vaadin-text-field
                              theme="small"
                              value=${this.nameStates?.[deck.id] || name}
                              autofocus
                              @value-changed=${(
                  e: TextFieldValueChangedEvent
                ) => {
                    this.nameStates = {
                      ...this.nameStates,
                      [deck.id]: e.detail.value,
                    };
                  }}
                              @keydown=${(e: KeyboardEvent) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      this.saveDeckName(
                        deck.id,
                        this.nameStates?.[deck.id]
                      );
                    }
                  }}
                            ></vaadin-text-field>`
                : html`<div
                              style="text-overflow: ellipsis; white-space: nowrap; overflow: hidden; flex: 1 1 auto;"
                              >${deck.public ? 'PUBLIC ' : 'PRIVATE'}${this
                    .nameStates?.[deck.id] || name}</div>`}
                        ${this?.editStates?.[deck.id]
                ? html`<vaadin-button
                              theme="icon small tertiary"
                              @click=${() =>
                    this.saveDeckName(
                      deck.id,
                      this.nameStates?.[deck.id]
                    )}
                              ><vaadin-icon icon="lumo:checkmark"></vaadin-icon
                            ></vaadin-button>`
                : html`<vaadin-button
                              theme="icon small tertiary"
                              @click=${() => this.editDeckName(deck.id)}
                              ><vaadin-icon icon="vaadin:edit"></vaadin-icon
                            ></vaadin-button>`}
                      </div>
                      <vaadin-button
                        slot="buttons"
                        theme="primary small error"
                        @click=${() => {
                this.deckToDelete = deck;
              }}
                      >
                        Delete
                      </vaadin-button>
                    </deck-list-item>
                  `;
          })}
              </div>
            </div>
          `;
        })}
        </div>
      </div>

      <vaadin-confirm-dialog
        header="Delete deck"
        cancel
        confirm-text="Delete"
        confirm-theme="error primary"
        .opened=${this.deckToDelete != null}
        @opened-changed=${(e: ConfirmDialogOpenedChangedEvent) => {
        if (!e.detail.value) {
          this.deckToDelete = null;
        }
      }}
        @confirm="${() => {
        this.deleteDeck(this?.deckToDelete!.id);
      }}"
        @cancel="${() => {
        this.deckToDelete = null;
      }}"
      >
        Are you sure you want to delete
        ${this?.deckToDelete?.name || 'this deck'}?
      </vaadin-confirm-dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'my-decks-route': MyDecksRoute;
  }
}
