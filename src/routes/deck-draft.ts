import {BeforeEnterObserver, RouterLocation} from '@vaadin/router';
import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, query, state} from 'lit/decorators.js';
import {FirebaseService} from '../services/firebase';
import {viewDeckCode} from '../utils/view-deck-code';
import {doc, getDoc, onSnapshot} from 'firebase/firestore';
import '../components/deck-draft/deck-draft-division-picker';
import '../components/deck-draft/deck-draft-unit-picker';
import {BucketFolder, BundleManagerService} from '../services/bundle-manager';
import {Division} from '../types/deck-builder';
import {Unit, UnitMap} from '../types/unit';
import {Deck} from '../classes/deck';
import '../components/deck-draft/deck-draft-deck-display';
import {exportDeckToCode} from '../utils/export-deck-to-code';
import {SideDrawer} from 'side-drawer';
import {DeckDraftFactory} from '../classes/deck-drafter/DeckDraftFactory';
import {onAuthStateChanged, User} from 'firebase/auth';
import {DeckDraftEngine} from '../classes/deck-drafter/DeckDraftEngineInterface';
import {DeckDraftController} from '../classes/deck-drafter/DeckDraftController';

export interface DeckDraftStateResponse {
  sessionId: string;
  state: UnitPickState | DivisionPickState;
}

export type DeckDraftState = UnitPickState | DivisionPickState;

interface DivisionPickState {
  phase: 'DIVISION_PICK';
  data: {
    choices: string[];
  };
}

export interface UnitPickState {
  phase: 'UNIT_PICK';
  data: {
    choices: PackChoice[];
    division: string;
    deckCode: string;
  };
}

// type guard for UnitPickState

function isUnitPickState(state: DeckDraftState): state is UnitPickState {
  return state.phase === 'UNIT_PICK';
}

export interface PackChoice {
  unit: string;
  transport: string | null;
  veterancy: number;
}

// TODO Unsubcribe from the session state when leaving the route

@customElement('deck-draft-route')
export class DeckDraftRoute extends LitElement implements BeforeEnterObserver {
  static get styles() {
    return css`
      :host {
        height: 100%;
      }

      .container {
        display: flex;
        max-height: 100%;
      }

      .content {
        flex: 1 1 80%;
        padding-bottom: 60px;
        overflow-y: auto;
      }

      summary-view {
        width: 100%;
      }

      .complete {
        display: flex;
        justify-content: center;
      }

      deck-draft-deck-display {
        flex: 1 1 20%;
      }

      .card {
        display: flex;
        flex-direction: column;
        background-color: var(--lumo-contrast-5pct);
        padding: var(--lumo-space-m);
      }

      .deck-summary-container {
        display: flex;
        flex-direction: column;
        width: 100%;
        padding: var(--lumo-space-m);
      }

      .deck-title {
        display: flex;
        justify-content: space-between;
        width: 100%;
      }

      .button-bar {
        display: flex;
        gap: var(--lumo-space-s);
      }

      @media (max-width: 1000px) {
        .hide-on-mobile {
          display: none;
        }
      }

      @media (min-width: 1001px) {
        .hide-on-desktop {
          display: none !important;
        }

        .content {
          padding-bottom: 0;
        }
      }

      side-drawer {
        background-color: var(--lumo-base-color);
        max-width: 95vw;
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
    `;
  }

  @state()
  private sessionId?: string;

  @state()
  private divisions?: Division[];

  @state()
  private units?: Unit[];

  @state()
  private unitMap?: UnitMap;

  @state()
  private showDeckDrawer = false;

  @query('side-drawer')
  drawer!: SideDrawer;

  openDeckDrawer() {
    this.showDeckDrawer = true;
    this.drawer.open = true;
  }

  closeDeckDrawer() {
    this.showDeckDrawer = false;
    this.drawer.open = false;
  }

  @state()
  completing = false;

  @state({
    hasChanged: () => {
      return true;
    },
  })
  private activeDeck: Deck | null = null;

  @state({
    hasChanged: () => {
      return true;
    },
  })
  private state?: DeckDraftState;

  user: User | null = null;

  engine?: DeckDraftEngine;
  engineController?: DeckDraftController;

  @state()
  private disableButtons = false;

  async onBeforeEnter(location: RouterLocation) {
    const divisions =
      (await BundleManagerService.getDivisionsForBucket(BucketFolder.WARNO)) ||
      [];
    const units =
      (await BundleManagerService.getUnitsForBucket(BucketFolder.WARNO)) || [];

    const unitMap = {} as UnitMap;
    for (const unit of units) {
      unitMap[unit.descriptorName] = unit;
    }

    this.divisions = divisions;
    this.units = units;
    this.unitMap = unitMap;

    this.sessionId = `${location.params.sessionId}`;

    if (this.sessionId) {
      if (this.sessionId === 'local') {
        const engine = await DeckDraftFactory.createEngineFromLocalStorage();
        const engineController = new DeckDraftController(engine);

        await this.setupDraftCallbacks(`${this.sessionId}`, engineController);
        this.engine = engine;
        this.engineController = engineController;
      } else {
        onAuthStateChanged(FirebaseService.auth, async (user) => {
          this.user = user;

          if (!user) {
            return;
          }

          if (!this.sessionId) {
            return;
          }

          const engine = await DeckDraftFactory.createServerEngineForSessionId(
            user,
            this.sessionId
          );

          const engineController = new DeckDraftController(engine);

          this.engine = engine;
          this.engineController = engineController;

          await this.setupDraftCallbacks(`${this.sessionId}`, engineController);
        });
      }
    }
  }

  async firstUpdated() {
    if (!this.engineController) {
      return;
    }
  }

  /**
   * Gets the existing session from firebase
   */
  async setupDraftCallbacks(
    sessionId: string,
    engineController: DeckDraftController
  ) {

    if (sessionId === 'local') {
      engineController?.registerCallback(() => {
        // @ts-ignore
        this.handleState(engineController.engine.state as DeckDraftState);
      });
      // @ts-ignore

      setTimeout(() => {
        // @ts-ignore
        this.handleState(engineController.engine.state as DeckDraftState);
        this.requestUpdate();
      }, 500);
    } else {
      const sessionDoc = doc(FirebaseService.db, 'deck_draft_state', sessionId);
      const session = await getDoc(sessionDoc);
      if (!session.exists()) {
        return;
      }
      // const sessionData = session.data() as DeckDraftStateResponse;
      /* const unsubscribe = */ onSnapshot(sessionDoc, (doc) => {
        if (doc.exists()) {
          const state = (doc.data() as DeckDraftStateResponse).state;
          this.handleState(state);
        }
      });
    }
  }

  private handleState(state: UnitPickState | DivisionPickState) {
    this.state = state;
    if (
      isUnitPickState(state) &&
      this.unitMap &&
      this.divisions &&
      state.data.deckCode !== undefined
    ) {
      if (state.data.deckCode !== '') {
        const deck = Deck.fromDeckCode(state.data.deckCode, {
          unitMap: this.unitMap,
          divisions: this.divisions,
        });

        this.activeDeck = deck;
      } else {
        const division = this.divisions.find(
          (division) =>
            division.descriptor === (this.state as UnitPickState).data.division
        ) as Division;

        const deck: Deck = new Deck({
          unitMap: this.unitMap,
          division: division,
        });

        this.activeDeck = deck;
      }
    }
  }

  async chooseOption(choice: number) {
    try {
      if (!this.engineController) {
        return;
      }

      this.disableButtons = true;
      await this.engineController.chooseOption(choice);
    } catch (error) {
      console.error('Error choosing division:', error);
    } finally {
      this.disableButtons = false;
    }
  }

  async completeDraft() {
    try {
      if (!this.engineController) {
        return;
      }
      this.completing = true;
      const deckCode = await this.engineController.completeDraft();
      viewDeckCode(deckCode);
    } catch (error) {
      console.error('Error completing draft:', error);
    } finally {
      this.completing = false;
    }
  }

  render(): TemplateResult {

    if (this.state?.phase === 'DIVISION_PICK') {
      return html`
        <deck-draft-division-picker
          class="content"
          .choices=${this.state.data.choices}
          .divisions=${this.divisions}
          .disable=${this.disableButtons}
          @division-chosen=${(e: CustomEvent) =>
            this.chooseOption(e.detail.choice)}
        ></deck-draft-division-picker>
      `;
    }

    if (this.state?.phase === 'UNIT_PICK') {
      return html`
        ${this.state.data.choices.length === 0
          ? html` <div class="content complete">
              <div class="deck-summary-container">
                <deck-header .deck=${this.activeDeck}>
                  <div class="deck-title" slot="title">
                    <deck-title
                      .deck=${this.activeDeck}
                      .name=${this.activeDeck?.division?.name}
                    >
                    </deck-title>
                    <div class="button-bar">
                      <vaadin-button
                        theme="large"
                        @click=${() => exportDeckToCode(this.activeDeck!)}
                      >
                        Copy Code
                      </vaadin-button>
                      <vaadin-button
                        theme="primary large"
                        @click=${() => this.completeDraft()}
                        .disabled=${this.completing}
                      >
                        Complete Draft
                      </vaadin-button>
                    </div>
                  </div>
                </deck-header>
                <summary-view .deck=${this.activeDeck}></summary-view>
              </div>
            </div>`
          : html`
              <side-drawer
                @open=${() => this.openDeckDrawer()}
                @close=${() => this.closeDeckDrawer()}
                ?open=${this.showDeckDrawer}
              >
                <deck-draft-deck-display
                  class=""
                  .deck=${this.activeDeck}
                ></deck-draft-deck-display>
              </side-drawer>
              <div class="button-drawer hide-on-desktop">
                <vaadin-button
                  @click=${() => this.openDeckDrawer()}
                  theme="large primary"
                  >View Deck</vaadin-button
                >
              </div>
              <div class="container">
                ${this.activeDeck === null
                  ? ''
                  : html`
                      <deck-draft-deck-display
                        class="hide-on-mobile"
                        .deck=${this.activeDeck}
                      ></deck-draft-deck-display>
                    `}

                <deck-draft-unit-picker
                  class="content"
                  .choices=${this.state.data.choices}
                  .units=${this.units}
                  .disable=${this.disableButtons}
                  .deck=${this.activeDeck}
                  @unit-chosen=${(e: CustomEvent) =>
                    this.chooseOption(e.detail.choice)}
                ></deck-draft-unit-picker>
              </div>
            `}
      `;
    }

    return html``;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'deck-draft-route': DeckDraftRoute;
  }
}
