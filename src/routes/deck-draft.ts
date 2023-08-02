import {BeforeEnterObserver, RouterLocation} from '@vaadin/router';
import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {FirebaseService} from '../services/firebase';
import {viewDeckCode} from '../utils/view-deck-code';
// import { BucketFolder, BundleManagerService } from '../services/bundle-manager';
import {doc, getDoc, onSnapshot} from 'firebase/firestore';
import '../components/deck-draft/deck-draft-division-picker';
import '../components/deck-draft/deck-draft-unit-picker';
import {BucketFolder, BundleManagerService} from '../services/bundle-manager';
import {Division} from '../types/deck-builder';
import {Unit, UnitMap} from '../types/unit';
import {Deck} from '../classes/deck';
import '../components/deck-draft/deck-draft-deck-display';

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
        display: flex;
        height: 100%;
      }

      .content {
        flex: 1 1 80%;
        margin-top: var(--lumo-space-l);
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
      await this.getDraftSession(this.sessionId);
    }
  }

  /**
   * Gets the existing session from firebase
   */
  async getDraftSession(sessionId: string) {
    const sessionDoc = doc(FirebaseService.db, 'deck_draft_state', sessionId);
    const session = await getDoc(sessionDoc);
    if (!session.exists()) {
      return;
    }
    // const sessionData = session.data() as DeckDraftStateResponse;
    /* const unsubscribe = */ onSnapshot(sessionDoc, (doc) => {
      if (doc.exists()) {
        this.state = (doc.data() as DeckDraftStateResponse).state;
        if (
          isUnitPickState(this.state) &&
          this.unitMap &&
          this.divisions &&
          this.state.data.deckCode !== undefined
        ) {
          if (this.state.data.deckCode !== '') {
            const deck = Deck.fromDeckCode(this.state.data.deckCode, {
              unitMap: this.unitMap,
              divisions: this.divisions,
            });

            this.activeDeck = deck;
          } else {
            const division = this.divisions.find(
              (division) =>
                division.descriptor ===
                (this.state as UnitPickState).data.division
            ) as Division;

            const deck: Deck = new Deck({
              unitMap: this.unitMap,
              division: division,
            });

            this.activeDeck = deck;
          }
        }
      }
    });
    // 404
    console.log('No session found');
  }

  async chooseOption(sessionId: string, choice: number) {
    try {
      this.disableButtons = true;
      console.log(this.disableButtons);
      const user = FirebaseService.auth.currentUser;
      const response = await fetch(
        `https://europe-west1-catur-11410.cloudfunctions.net/deckDraftChoose`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${await user?.getIdToken()}`,
          },
          body: JSON.stringify({
            sessionId,
            choice,
          }),
        }
      );

      if (response.ok) {
        console.log(response);
        console.log('Division chosen successfully.');
        // Perform any additional steps or navigation after choosing the division
      } else {
        console.error('Failed to choose division.');
      }
      this.disableButtons = false;
    } catch (error) {
      console.error('Error choosing division:', error);
      this.disableButtons = false;
    }
  }

  async completeDraft(sessionId: string) {
    try {
      this.completing = true;
      const user = FirebaseService.auth.currentUser;
      const response = await fetch(
        `https://europe-west1-catur-11410.cloudfunctions.net/deckDraftComplete`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${await user?.getIdToken()}`,
          },
          body: JSON.stringify({
            sessionId,
          }),
        }
      );

      if (response.ok) {
        console.log(response);

        const responseContent = await response.json();
        viewDeckCode(responseContent.deckCode);

        console.log('Finished');
        // Perform any additional steps or navigation after choosing the division
      }
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
            this.chooseOption(this.sessionId!, e.detail.choice)}
        ></deck-draft-division-picker>
      `;
    }

    if (this.state?.phase === 'UNIT_PICK') {
      return html`
        ${this.activeDeck === null
          ? ''
          : html`
              <deck-draft-deck-display
                .deck=${this.activeDeck}
              ></deck-draft-deck-display>
            `}
        ${this.state.data.choices.length === 0
          ? html` <div class="content complete">
              <vaadin-button
                theme="primary large"
                @click=${() => this.completeDraft(this.sessionId!)}
                .disabled=${this.completing}
              >
                Complete Draft
              </vaadin-button>
            </div>`
          : html` <deck-draft-unit-picker
              class="content"
              .choices=${this.state.data.choices}
              .units=${this.units}
              .disable=${this.disableButtons}
              .deck=${this.activeDeck}
              @unit-chosen=${(e: CustomEvent) =>
                this.chooseOption(this.sessionId!, e.detail.choice)}
            ></deck-draft-unit-picker>`}
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

/*
        <vaadin-button @click=${() => this.completeDraft(this.sessionId!)}>
          Complete Draft
        </vaadin-button>
          */
