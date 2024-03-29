import { BeforeEnterObserver, RouterLocation } from '@vaadin/router';
import { css, html, LitElement, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { DivisionsMap } from '../types/deck-builder';
import { UnitMap } from '../types/unit';
import { Deck } from '../classes/deck';
import '@vaadin/menu-bar';
import { notificationService } from '../services/notification';
import { MenuBarItem, MenuBarItemSelectedEvent } from '@vaadin/menu-bar';
import { User } from 'firebase/auth';
import { exportDeckToCode } from '../utils/export-deck-to-code';
import { viewDeckCode } from '../utils/view-deck-code';
import '../components/intel-report';
import '@vaadin/tabs';
import { TabsSelectedChangedEvent } from '@vaadin/tabs';
import { BucketFolder, BundleManagerService } from '../services/bundle-manager';
import { TextFieldValueChangedEvent } from '@vaadin/text-field';
import { DialogOpenedChangedEvent } from '@vaadin/dialog';
import { dialogRenderer, dialogFooterRenderer } from '@vaadin/dialog/lit.js';
import '@vaadin/tooltip';
import { DeckDatabaseAdapter, DeckRecord } from '../classes/DeckDatabaseAdapter';
import { FirebaseService } from '../services/firebase';
import { updateDeckToDatabase } from '../utils/update-deck-to-database';
import { LastPatchMixin } from '../mixins/last-patch';

@customElement('deck-view-route')
export class DeckViewRoute extends LastPatchMixin(LitElement) implements BeforeEnterObserver {
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
          'compile',
          'Export',
          false,
          this.actionHappening
        ),
        text: 'Export',
        disabled: this.actionHappening,
      },
    ];

    if (
      this.loggedInUser &&
      this.deckRecord?.creator === this.loggedInUser?.uid
    ) {
      if (this.contentCreator) {
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

      if (this.deckRecord?.public) {
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
      } else {
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

      }
    }

    return items;
  }

  deckId?: number;
  deck?: Deck;

  @state({
    hasChanged: () => {
      return true;
    },
  })
  deckRecord?: DeckRecord;

  @property()
  loggedInUser: User | null | undefined;

  youtubeLink?: string;

  @property()
  contentCreator = false;

  @property()
  youtubeLinkDialogOpened = false;

  @property()
  isOutdated = true;

  @state()
  deckError = false;

  @state()
  selectedTabIndex = 0;

  async onBeforeEnter(location: RouterLocation) {

    try {
      this.youtubeLink = undefined;
      this.deckId = Number(location.params.deckId);

      FirebaseService.auth?.onAuthStateChanged((user: User | null) => {
        this.loggedInUser = user;
        this.requestUpdate();
      });

      const [units, divisions] = await Promise.all([
        this.fetchUnitMap(),
        this.fetchDivisionMap(),
      ]);

      await this.fetchDeck(this.deckId, units, divisions);

      FirebaseService.auth.onAuthStateChanged(async (user) => {
        this.loggedInUser = user;
        if (user) {
          const tokenResult = await user.getIdTokenResult();
          const contentCreator = tokenResult.claims.contentCreator;
          this.contentCreator = contentCreator;
        }
      });
    }
    catch (err) {
      console.error(err);
      this.deckError = true;
    }
  }

  async fetchDeck(deckId: number, units: UnitMap, divisions: DivisionsMap) {
    const deckResponse = await DeckDatabaseAdapter.getDeck(deckId);
    const deck = deckResponse.data;
    this.deckRecord = deck;

    const availableDivisions = Object.values(divisions);
    const deckFromString = Deck.fromDeckCode(deck.code as string, {
      unitMap: units,
      divisions: availableDivisions,
    });

    const lastPatchDate = await this.getLastPatchDate();
    this.isOutdated = lastPatchDate > new Date(deck.updatedAt);

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


  async togglePublic(userDeck: DeckRecord) {
    if (userDeck) {
      if (this.loggedInUser?.uid === userDeck.creator) {
        await updateDeckToDatabase(userDeck.id, undefined, !userDeck.public);
        await this.fetchDeck(userDeck.id, await this.fetchUnitMap(), await this.fetchDivisionMap());
      }
    }


  }

  async toolbarItemSelected(value: string) {
    switch (value) {
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
        if (this.deckRecord) {
          await this.togglePublic(this.deckRecord);
        }
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
            this.deckRecord?.id,
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
                ${(this.deckRecord as any)?.isPro
        ? html`<simple-chip class="pro">PRO</simple-chip>`
        : ''}
                ${(this.deckRecord as any)?.isContentCreator
        ? html`<simple-chip class="pro">CC</simple-chip>`
        : ''}


                <div
                  style="display: flex; flex-direction: column; flex: 1 1 0; overflow: hidden;"
                >
                  <h2>${this.deckRecord?.name}</h2>
                  
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
        
        ${this.deckRecord?.youtubeLink
        ? this.renderEmbed(this.deckRecord?.youtubeLink as string)
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

      await DeckDatabaseAdapter.updateDeck(this.deckRecord?.id as number, {
        youtubeLink: link
      });

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


}

declare global {
  interface HTMLElementTagNameMap {
    'deck-view-route': DeckViewRoute;
  }
}
