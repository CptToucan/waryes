import {BeforeEnterObserver, Router, RouterLocation} from '@vaadin/router';
import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {UnitsDatabaseService} from '../services/units-db';
import {DivisionsDatabaseService} from '../services/divisions-db';
import {DivisionsMap} from '../types/deck-builder';
import {UnitMap} from '../types/unit';
import {
  doc,
  DocumentData,
  DocumentReference,
  getDoc,
  QueryDocumentSnapshot,
  setDoc,
} from 'firebase/firestore';
import {FirebaseService} from '../services/firebase';
import {Deck} from '../classes/deck';
import '@vaadin/menu-bar';
import {notificationService} from '../services/notification';
import {MenuBarItem, MenuBarItemSelectedEvent} from '@vaadin/menu-bar';
import {getAuth, User} from 'firebase/auth';
import {exportDeckToCode} from '../utils/export-deck-to-code';
import {saveDeckToFirebase} from '../utils/save-deck-to-firebase';
import {viewDeckCode} from '../utils/view-deck-code';

@customElement('deck-view-route')
export class DeckViewRoute extends LitElement implements BeforeEnterObserver {
  static get styles() {
    return css`
      .container {
        display: flex;
        flex-direction: column;
        padding-left: var(--lumo-space-s);
        padding-right: var(--lumo-space-s);
      }

      deck-header {
        width: 100%;
      }

      h2 {
        margin: 0;
      }

      div[slot='title'] {
        display: flex;
        flex-direction: row;
        column-gap: var(--lumo-space-s);
      }

      @media (max-width: 800px) {
        h2 {
          font-size: var(--lumo-font-size-m);
        }

        [slot='toolbar'] {
          font-size: var(--lumo-font-size-s);
        }
      }

      .pro {
        --color: var(--lumo-secondary-color);
        --background: var(--lumo-contrast-10pct);
      }
    `;
  }

  get toolbarItems(): MenuBarItem[] {
    const items = [
      {
        component: this.createItem('plus', `Vote (${this.voteCount})`),
        text: 'Vote',
      },
      {component: this.createItem('compile', 'Export'), text: 'Export'},
    ];

    if (this.loggedInUser?.uid) {
      items.push({component: this.createItem('copy', 'Copy'), text: 'Copy'});
    }
    if (
      this.loggedInUser &&
      this.userDeck?.created_by === this.loggedInUser?.uid
    ) {
      items.push({component: this.createItem('edit', 'Edit'), text: 'Edit'});
    }

    return items;
  }

  @state()
  get voteCount(): number {
    return this._voteCount;
  }

  set voteCount(value: number) {
    this._voteCount = value;
  }

  @state()
  private _voteCount = 0;

  deckId?: string;
  deck?: Deck;

  @state({
    hasChanged: () => {
      return true;
    },
  })
  userDeck?: DocumentData;
  userDeckRef?: DocumentReference<DocumentData>;

  copyDeck?: DocumentData;

  @property()
  loggedInUser: User | null | undefined;

  async onBeforeEnter(location: RouterLocation) {
    this.deckId = location.params.deckId as string;
    FirebaseService.auth?.onAuthStateChanged((user) => {
      this.loggedInUser = user;
    });
    await this.fetchDeck(this.deckId);
  }

  async fetchDeck(deckId: string) {
    const ref = doc(FirebaseService.db, 'decks', deckId);
    const deckSnap = await getDoc(ref);
    if (deckSnap.exists()) {
      this.userDeck = {...deckSnap.data(), id: deckSnap.id};
      this.userDeckRef = ref;

      if (this.userDeck?.copied_from) {
        const copyDoc = await getDoc(deckSnap.data().copied_from);
        this.copyDeck = copyDoc.exists()
          ? {
              ...(copyDoc as QueryDocumentSnapshot<DocumentData>).data(),
              id: copyDoc.id,
            }
          : undefined;
      } else {
        this.copyDeck = undefined;
      }
    }

    this.voteCount = this.userDeck?.vote_count || 0;

    const [units, divisions] = await Promise.all([
      this.fetchUnitMap(),
      this.fetchDivisionMap(),
    ]);

    const availableDivisions = Object.values(divisions);
    const deckFromString = Deck.fromDeckCode(this.userDeck?.code as string, {
      unitMap: units,
      divisions: availableDivisions,
    });

    this.deck = deckFromString;
  }

  async fetchUnitMap() {
    const units = await UnitsDatabaseService.fetchUnits();
    const unitMap: UnitMap = {};

    if (units) {
      for (const unit of units) {
        unitMap[unit.descriptorName] = unit;
      }
    }

    return unitMap;
  }

  async fetchDivisionMap() {
    const divisions = await DivisionsDatabaseService.fetchDivisions();
    const divisionMap: DivisionsMap = {};

    if (divisions) {
      for (const division of divisions) {
        divisionMap[division.descriptor] = division;
      }
    }

    return divisionMap;
  }

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

  async copy(userDeck: DocumentData | undefined, deck: Deck | undefined) {
    if (userDeck && deck) {
      const auth = getAuth();
      const user = auth.currentUser;

      const deckName = `${user?.displayName}'s ${this.deck?.division.name}`;
      const deckRef = await saveDeckToFirebase(
        deck,
        deckName,
        userDeck.tags,
        this.userDeckRef
      );
      Router.go(`/deck/${deckRef?.id}`);
    }
  }

  toolbarItemSelected(value: string) {
    switch (value) {
      case 'Vote':
        this.vote(this.userDeck?.id, this.loggedInUser?.uid as string);
        break;
      case 'Copy':
        this.copy(this.userDeck, this.deck);
        break;
      case 'Export':
        exportDeckToCode(this.deck);
        break;
      case 'Edit':
        if (this.deck) {
          viewDeckCode(
            this.deck.toDeckCode(),
            undefined,
            this.userDeck?.id,
            true
          );
        } else {
          console.error('No deck to edit');
        }
        break;
    }
  }

  createItem(iconName: string, text: string, isChild = false) {
    const item = document.createElement('vaadin-context-menu-item');
    const icon = document.createElement('vaadin-icon');

    if (isChild) {
      icon.style.width = 'var(--lumo-icon-size-s)';
      icon.style.height = 'var(--lumo-icon-size-s)';
      icon.style.marginRight = 'var(--lumo-space-s)';
    }

    if (iconName === 'copy') {
      item.setAttribute('aria-label', 'duplicate');
    }

    icon.setAttribute('icon', `vaadin:${iconName}`);
    item.appendChild(icon);
    if (text) {
      item.appendChild(document.createTextNode(text));
    }
    return item;
  }

  render(): TemplateResult {
    if (!this.deck) {
      return html`<div>Loading...</div>`;
    }

    return html`<div class="container">
      <deck-header .deck=${this.deck}>
        <div slot="title" style="display: flex; width: 100%;">
          <deck-title
            .deck=${this.deck}
            style="flex: 1 1 0; width: 100%; display: flex; overflow: hidden;"
          >
            <div
              slot="title"
              style="display: flex; flex: 1 1 0; align-items: center;"
            >
              ${this.userDeck?.is_pro_deck
                ? html`<simple-chip class="pro">PRO</simple-chip>`
                : ''}

              <div
                style="display: flex; flex-direction: column; flex: 1 1 0; overflow: hidden;"
              >
                <h2>${this.userDeck?.name}</h2>

                ${this.copyDeck
                  ? html` <div
                      style="display: flex; align-items: center; font-size: var(--lumo-font-size-s); overflow: hidden;"
                    >
                      Copied from:

                      <a
                        style="  overflow: hidden;
  text-overflow: ellipsis; white-space: nowrap;"
                        href="/deck/${this.copyDeck?.id}"
                        target="_blank"
                      >
                        ${this.copyDeck?.name}
                      </a>
                    </div>`
                  : ''}
              </div>
            </div>
          </deck-title>
        </div>
        <div class="toolbar-menu" slot="toolbar">
          <vaadin-menu-bar
            .items=${this.toolbarItems}
            @item-selected=${(event: MenuBarItemSelectedEvent) => {
              this.toolbarItemSelected(event.detail?.value?.text || '');
            }}
          ></vaadin-menu-bar>
        </div>
      </deck-header>
      <summary-view .deck=${this.deck}></summary-view>
    </div>`;
  }

  async vote(itemId: string, userId: string): Promise<void> {
    const db = FirebaseService.db;
    try {
      // Check if the user has already voted on the item
      const userVoteDoc = doc(db, `decks/${itemId}/user_votes/${userId}`);

      if (!this.loggedInUser) {
        console.log('User not logged in');
        notificationService.instance?.addNotification({
          content: 'Please log in to vote',
          theme: 'error',
          duration: 5000,
        });
        return;
      }

      const voteDocSnapshot = await getDoc(userVoteDoc);

      if (voteDocSnapshot.exists()) {
        console.log('User has already voted on this deck.');
        notificationService.instance?.addNotification({
          content: 'Already voted on this deck',
          theme: 'error',
          duration: 5000,
        });
        return;
      }

      await setDoc(userVoteDoc, {
        voted: true,
      });

      console.log('Vote added successfully.');

      this.voteCount += 1;

      this.requestUpdate();

      notificationService.instance?.addNotification({
        content: 'Vote added successfully',
        theme: 'success',
        duration: 5000,
      });
    } catch (error) {
      console.log(`Error voting: ${(error as any)?.message}`);

      notificationService.instance?.addNotification({
        content: 'Unable to add vote',
        theme: 'error',
        duration: 5000,
      });
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'deck-view-route': DeckViewRoute;
  }
}
