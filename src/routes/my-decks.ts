import {User} from 'firebase/auth';
import {
  collection,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
  limit,
} from 'firebase/firestore';
import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {FirebaseService} from '../services/firebase';
import {DivisionsMap} from '../types/deck-builder';
import {UnitMap} from '../types/unit';
import '../components/deck-library/deck-list-item';
import {TextFieldValueChangedEvent} from '@vaadin/text-field';
import {Router} from '@vaadin/router';
import '@vaadin/confirm-dialog';
import {ConfirmDialogOpenedChangedEvent} from '@vaadin/confirm-dialog';
import {notificationService} from '../services/notification';
import {BucketFolder, BundleManagerService} from '../services/bundle-manager';

const TOTAL_ALLOWED_DECKS = 60;

@customElement('my-decks-route')
export class MyDecksRoute extends LitElement {
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

  @property()
  loggedInUser: User | null | undefined;

  @property()
  decks: DocumentData[] | null = null;

  @property()
  decksByDivision?: {
    [key: string]: DocumentData[];
  };

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
  deckToDelete: DocumentData | null = null;

  @state()
  private _numberOfDecks = 0;
  public get numberOfDecks() {
    return this._numberOfDecks;
  }
  public set numberOfDecks(value) {
    this._numberOfDecks = value;
  }

  unitMap?: UnitMap;
  divisionsMap?: DivisionsMap;

  async onBeforeEnter() {
    FirebaseService.auth?.onAuthStateChanged(async (user) => {
      try {
        
        this.loggedInUser = user;

        if (
          this.loggedInUser !== null &&
          this.loggedInUser?.uid &&
          !this.decksByDivision
        ) {
          
          const deckCollection = collection(FirebaseService.db, 'decks');
          const q =  query(deckCollection, where('created_by', '==', this.loggedInUser?.uid), limit(60));
          const decksResponse = await getDocs(q); 
          const decks:DocumentData[] = [];

          decksResponse.forEach((deck) => {
            const deckData = deck.data();
            if (deckData) {
              decks.push(deck);
            }
          });

          this.decks = decks;
          this.numberOfDecks = this.decks?.length || 0;

          const userDeckCollection = collection(FirebaseService.db, 'user_decks');
          const userDeckSnap = await getDoc(
            doc(userDeckCollection, this.loggedInUser?.uid)
          );

          this.deckNames = userDeckSnap?.data()?.deckNames || {};

          // group decks by division
          this.decksByDivision = this.decks.reduce((acc, deck) => {
            const division = deck.data()?.division;
            if (!acc[division]) {
              acc[division] = [];
            }
            acc[division].push(deck);
            return acc;
          }, {});
          
        }
        
      } catch (error) {
        console.error(error);
      }
    });

    const [units, divisions] = await Promise.all([
      this.fetchUnitMap(),
      this.fetchDivisionMap(),
    ]);

    this.unitMap = units;
    this.divisionsMap = divisions;
  }

  /**
   * Returns a map of unit descriptors to unit objects
   * @returns A map of unit descriptors to unit objects
   */
  async fetchUnitMap() {
    const units = await BundleManagerService.getUnitsForBucket(
      BucketFolder.WARNO
    );
    const unitMap: UnitMap = {};

    if (units) {
      for (const unit of units) {
        unitMap[unit.descriptorName] = unit;
      }
    }

    return unitMap;
  }

  /**
   * Returns a map of division descriptors to division objects
   * @returns A map of division descriptors to division objects
   */
  async fetchDivisionMap() {
    const divisions = await BundleManagerService.getDivisionsForBucket(
      BucketFolder.WARNO
    );
    const divisionMap: DivisionsMap = {};

    if (divisions) {
      for (const division of divisions) {
        divisionMap[division.descriptor] = division;
      }
    }

    return divisionMap;
  }

  async saveDeckName(deckId: string, name = '') {
    // Saves the deck name to the user's deck names

    const deckCollection = collection(FirebaseService.db, 'user_decks');
    const deckDoc = doc(deckCollection, this.loggedInUser?.uid);
    const deckSnap = await getDoc(deckDoc);
    const userDeckData = deckSnap.data();
    const deckNames = userDeckData?.deckNames || {};

    await updateDoc(deckDoc, {
      deckNames: {
        ...deckNames,
        [deckId]: name,
      },
    });

    deckNames[deckId] = name;

    this.nameStates = {
      ...this.nameStates,
      [deckId]: name,
    };

    this.editStates = {
      ...this.editStates,
      [deckId]: false,
    };
  }

  editDeckName(deckId: string) {
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
  async deleteDeck(deckId: string) {
    try {
      const deckCollection = collection(FirebaseService.db, 'decks');
      const deckDoc = doc(deckCollection, deckId);
      await deleteDoc(deckDoc);

      notificationService.instance?.addNotification({
        duration: 3000,
        content: 'Deck deleted',
        theme: '',
      });

      for (const division in this.decksByDivision) {
        const divisionDecks = this.decksByDivision[division];

        // remove the deck with the id from the divisionDecks
        const newDivisionDecks = divisionDecks.filter(
          (deck) => deck.id !== deckId
        );
        this.decksByDivision[division] = newDivisionDecks;
      }

      this.numberOfDecks--;
      this.requestUpdate();
    } catch (err) {
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
        <h2>My Decks ${this.numberOfDecks}/${TOTAL_ALLOWED_DECKS}</h2>
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
                  const name = this.deckNames?.[deck.id] || deck.data().name;

                  return html`
                    <deck-list-item
                      .hideVotes=${true}
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
                              >${deck.data().public ? 'PUBLIC ' : ''}${this
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
          this.deleteDeck(this.deckToDelete?.id);
        }}"
        @cancel="${() => {
          this.deckToDelete = null;
        }}"
      >
        Are you sure you want to delete
        ${this?.deckToDelete?.data().name || 'this deck'}?
      </vaadin-confirm-dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'my-decks-route': MyDecksRoute;
  }
}
