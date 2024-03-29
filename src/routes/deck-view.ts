import {BeforeEnterObserver, Router, RouterLocation} from '@vaadin/router';
import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {DivisionsMap} from '../types/deck-builder';
import {UnitMap} from '../types/unit';
import {
  collection,
  doc,
  DocumentData,
  DocumentReference,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
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
import {updateDeckToFirebase} from '../utils/update-deck-to-firebase';
import '../components/intel-report';
import '@vaadin/tabs';
import {TabsSelectedChangedEvent} from '@vaadin/tabs';
import {BucketFolder, BundleManagerService} from '../services/bundle-manager';
import {TextFieldValueChangedEvent} from '@vaadin/text-field';
import {DialogOpenedChangedEvent} from '@vaadin/dialog';
import {dialogRenderer, dialogFooterRenderer} from '@vaadin/dialog/lit.js';
import {FirebasePatchRecord} from './patch-notes';
import '@vaadin/tooltip';

const BASE_URL = 'https://europe-west1-catur-11410.cloudfunctions.net';
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

      .embed-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding-top: var(--lumo-space-s);
        padding-bottom: var(--lumo-space-s);
      }
    `;
  }

  @state()
  actionHappening = false;

  get toolbarItems(): MenuBarItem[] {
    const items: MenuBarItem[] = [
      {
        component: this.createItem(
          'plus',
          `Vote (${this.voteCount})`,
          false,
          this.actionHappening
        ),
        text: 'Vote',
        disabled: this.actionHappening,
      },
      {
        component: this.createItem(
          'compile',
          'Export',
          false,
          this.actionHappening
        ),
        text: 'Export',
        disabled: this.actionHappening,
      },
    ];

    if (this.loggedInUser?.uid) {
      items.push({
        component: this.createItem('copy', 'Copy', false, this.actionHappening),
        text: 'Copy',
        disabled: this.actionHappening,
      });
    }
    if (
      this.loggedInUser &&
      this.userDeck?.created_by === this.loggedInUser?.uid
    ) {
      if (this.userInfo?.is_content_creator) {
        items.push({
          component: this.createItem(
            'link',
            'Link',
            false,
            this.actionHappening
          ),
          text: 'Link',
          disabled: this.actionHappening,
        });
      }

      items.push({
        component: this.createItem('edit', 'Edit', false, this.actionHappening),
        text: 'Edit',
        disabled: this.actionHappening,
      });

      if (this.userDeck?.public) {
        items.push({
          component: this.createItem(
            'eye-slash',
            'Private',
            false,
            this.actionHappening
          ),
          text: 'Private',
          disabled: this.actionHappening,
        });
      } else {
        items.push({
          component: this.createItem(
            'eye',
            'Public',
            false,
            this.actionHappening
          ),
          text: 'Public',
          disabled: this.actionHappening,
        });
      }
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

  youtubeLink?: string;

  @property()
  userInfo: null | DocumentData = null;

  @property()
  youtubeLinkDialogOpened = false;

  @property()
  isOutdated = false;

  @state()
  deckError = false;

  @state()
  selectedTabIndex = 0;

  async fetchLastPatch() {
    const q = query(
      collection(FirebaseService.db, 'patches'),
      orderBy('created', 'desc'),
      limit(1)
    );

    const querySnapshot = await getDocs(q);

    const patchArray = querySnapshot.docs.map((doc) =>
      doc.data()
    ) as FirebasePatchRecord[];
    return patchArray[0]?.created.toDate() || new Date();
  }

  async onBeforeEnter(location: RouterLocation) {
    try {
      this.youtubeLink = undefined;
      this.deckId = location.params.deckId as string;
      FirebaseService.auth?.onAuthStateChanged(async (user) => {
        this.loggedInUser = user;
        const ref = doc(
          FirebaseService.db,
          'users',
          this.loggedInUser?.uid || ''
        );
        const userSnap = await getDoc(ref);

        if (userSnap.exists()) {
          this.userInfo = userSnap.data();
        }
      });
      await this.fetchDeck(this.deckId);

      const params = new URLSearchParams(location.search);
      const copied = params.get('copied');
      if (copied) {
        this.actionHappening = true;
        setTimeout(async () => {
          this.actionHappening = false;
        }, 5000);
      }
    } catch (err) {
      console.error(err);
      this.deckError = true;
    }
  }

  async fetchDeck(deckId: string) {
    const ref = doc(FirebaseService.db, 'decks', deckId);
    const deckSnap = await getDoc(ref);
    if (deckSnap.exists()) {
      this.userDeck = {...deckSnap.data(), id: deckSnap.id};
      this.userDeckRef = ref;

      try {
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

        const lastPatch = await this.fetchLastPatch();
        this.isOutdated = this.userDeck?.updated.toDate() < lastPatch;
      } catch (err) {
        console.error(err);
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
    this.actionHappening = true;
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
      Router.go(`/deck/${deckRef?.id}?copied=true`);
    }
    setTimeout(() => {
      this.actionHappening = false;
    }, 2000);
  }

  async togglePublic(userDeck: DocumentData | undefined) {
    if (userDeck) {
      if (this.loggedInUser?.uid === userDeck.created_by) {
        await updateDeckToFirebase(userDeck.id, undefined, !userDeck.public);

        this.userDeck = {
          ...this.userDeck,
          public: !userDeck.public,
        };
      }
    }
  }

  async toolbarItemSelected(value: string) {
    switch (value) {
      case 'Vote':
        this.vote(this.userDeck?.id, this.loggedInUser?.uid as string);
        break;
      case 'Copy':
        this.copy(this.userDeck, this.deck);
        break;
      case 'Export':
        this.actionHappening = true;
        await exportDeckToCode(this.deck);
        setTimeout(() => {
          this.actionHappening = false;
        }, 1000);
        break;
      case 'Link':
        this.openYoutubeDialog();
        break;
      case 'Public':
      case 'Private':
        this.actionHappening = true;
        await this.togglePublic(this.userDeck);
        setTimeout(() => {
          this.actionHappening = false;
        }, 1000);
        break;
      case 'Edit':
        this.actionHappening = true;
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
        setTimeout(() => {
          this.actionHappening = false;
        }, 1000);
        break;
    }
  }

  createItem(
    iconName: string,
    text: string,
    isChild = false,
    disabled = false
  ) {
    const item = document.createElement('vaadin-context-menu-item');
    const icon = document.createElement('vaadin-icon');

    if (disabled) {
      item.setAttribute('disabled', '');
    }

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
    if (this.deckError) {
      return html`<h1 style="padding: var(--lumo-space-l);">
        Deck not found
      </h1>`;
    }
    if (!this.deck) {
      return html`<div>Loading...</div>`;
    }

    let tabContent = html``;
    switch (this.selectedTabIndex) {
      case 0:
        tabContent = html`<summary-view .deck=${this.deck}></summary-view>`;
        break;
      case 1:
        tabContent = html`<intel-report .deck=${this.deck}></intel-report>`;
        break;
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
                ${this.userDeck?.is_content_creator_deck
                  ? html`<simple-chip class="pro">CC</simple-chip>`
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
                          style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
                          href="/deck/${this.copyDeck?.id}"
                          target="_blank"
                        >
                          ${this.copyDeck?.name}
                        </a>
                      </div>`
                    : ''}
                </div>
                ${this.isOutdated
                  ? html` <vaadin-icon id="warning-icon" icon="vaadin:warning">
                      </vaadin-icon
                      ><vaadin-tooltip
                        for="warning-icon"
                        text=${"This deck hasn't been updated since the last patch and might not work anymore."}
                        position="top-end"
                      ></vaadin-tooltip>`
                  : ''}
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
        ${this.userDeck?.youtube_link
          ? this.renderEmbed(this.userDeck?.youtube_link)
          : html``}
        <vaadin-tabs
          @selected-changed=${(e: TabsSelectedChangedEvent) => {
            const tabIndex = e.detail.value;
            this.selectedTabIndex = tabIndex;
          }}
        >
          <vaadin-tab>Deck</vaadin-tab>
          <vaadin-tab>Report</vaadin-tab>
        </vaadin-tabs>
        ${tabContent}
      </div>
      ${this.renderYoutubeLinkDialog()} `;
  }

  renderEmbed(link: string) {
    return html`<div class="embed-container">
      <iframe
        width="560"
        height="315"
        src=${link}
        frameborder="0"
        allow="autoplay;picture-in-picture"
      ></iframe>
    </div>`;
  }

  renderYoutubeLinkDialog() {
    return html`<vaadin-dialog
      aria-label="Input Youtube Link"
      header-title="Input Youtube Link"
      .opened="${this.youtubeLinkDialogOpened}"
      @opened-changed="${(event: DialogOpenedChangedEvent) => {
        this.youtubeLinkDialogOpened = event.detail.value;
        if (event.detail.value === false) {
          this.actionHappening = false;
        }
      }}"
      ${dialogRenderer(
        () =>
          html`<vaadin-text-field
            style="width: 100%"
            .value="${this.youtubeLink}"
            @value-changed=${(e: TextFieldValueChangedEvent) => {
              this.youtubeLink = e.detail.value;
            }}
            label="Link"
          ></vaadin-text-field>`,
        [this.youtubeLink]
      )}
      ${dialogFooterRenderer(
        () =>
          html` <vaadin-button
              @click="${() => {
                this.closeYoutubeDialog();
              }}"
              .disabled="${this.actionHappening}"
              >Close</vaadin-button
            >
            <vaadin-button
              theme="primary"
              @click="${() => {
                this.saveYoutubeLink(this.youtubeLink || '');
              }}"
              .disabled="${this.actionHappening}"
              >Save</vaadin-button
            >`,
        [this.actionHappening]
      )}
    ></vaadin-dialog>`;
  }

  async saveYoutubeLink(link: string) {
    try {
      this.actionHappening = true;
      const user = this.loggedInUser;

      if (!user) {
        return;
      }

      const headers = new Headers();
      headers.append('Authorization', `Bearer ${await user.getIdToken()}`);

      const response = await fetch(`${BASE_URL}/setYoutubeLink`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          deckId: this.userDeck?.id,
          youtubeLink: link,
        }),
      });

      if (!response?.ok) {
        throw new Error('Error saving youtube link');
      }

      notificationService.instance?.addNotification({
        content: 'Youtube link saved, refreshing...',
        theme: 'success',
        duration: 5000,
      });
    } catch (err) {
      console.error(err);
      notificationService.instance?.addNotification({
        content: 'Error saving youtube link, refreshing...',
        theme: 'error',
        duration: 5000,
      });
    } finally {
      this.closeYoutubeDialog();
      // refresh page
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  }

  private openYoutubeDialog() {
    this.youtubeLinkDialogOpened = true;
  }

  private closeYoutubeDialog() {
    this.youtubeLink = undefined;
    this.youtubeLinkDialogOpened = false;
    this.actionHappening = false;
  }

  async vote(itemId: string, userId: string): Promise<void> {
    const db = FirebaseService.db;
    this.actionHappening = true;
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
    } finally {
      setTimeout(() => {
        this.actionHappening = false;
      }, 1000);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'deck-view-route': DeckViewRoute;
  }
}
