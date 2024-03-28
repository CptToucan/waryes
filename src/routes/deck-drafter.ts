import {Router} from '@vaadin/router';
import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {FirebaseService} from '../services/firebase';
// @ts-ignore
import WaryesImage from '../../images/waryes-transparent.png';
import {BeforeEnterObserver} from '@vaadin/router';
import {User} from 'firebase/auth';
import {DeckDraftFactory} from '../classes/deck-drafter/DeckDraftFactory';

@customElement('deck-drafter-route')
export class DeckDrafterRoute
  extends LitElement
  implements BeforeEnterObserver
{
  static get styles() {
    return css`
      :host {
        display: flex;
        align-items: flex-start;
        justify-content: center;
        flex: 1 1 100%;
        position: relative;
        height: calc(100vh - 44px);
      }

      simple-chip {
        --background: var(--lumo-secondary-color-10pct);
        --color: var(--lumo-secondary-color);
        display: inline-flex;
        justify-content: center;
        margin-left: auto;
        margin-right: auto;
        letter-spacing: 0.1em;
        margin-left: 0.5em;
      }

      section {
        height: 100%;
        width: 100%;
        perspective: 50vmax;
        overflow: hidden;
        background-image: linear-gradient(
          to top,
          #0f0209,
          #23061d,
          #330531,
          #3e024b,
          #41056a,
          #520578,
          #640385,
          #770092,
          #9b0089,
          #b8007e,
          #ce1173,
          #e03168
        );
      }

      div.crawl {
        background-size: 40px 40px;
        background-image: linear-gradient(
            to right,
            rgba(255, 255, 255, 0.2) 1px,
            transparent 1px
          ),
          linear-gradient(
            to bottom,
            rgba(255, 255, 255, 0.2) 1px,
            transparent 1px
          );
        height: inherit;
        transform: rotateX(50deg);
        transform-origin: top center;
        animation: 15s linear infinite crawlingWall;
        background-position-y: top;
      }

      .card {
        display: flex;
        flex-direction: column;

        border-radius: var(--lumo-border-radius);
        padding: var(--lumo-space-m);
        overflow-y: auto;
        max-height: 100%;
        background-color: var(--lumo-base-color);
        margin-top: var(--lumo-space-m);
      }

      @media (max-width: 500px) {
        .card {
          margin-top: 0;
        }
      }

      .card::before {
        opacity: 0.9;

        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        height: 100%;
        border-radius: inherit;
      }

      .center {
        position: absolute;
        z-index: 1;
        max-width: 600px;
      }

      .card img {
        max-width: 320px;
      }

      .header {
        display: flex;
        align-items: center;
        flex-direction: column;
        position: relative;
      }

      .header span {
        font-size: 2rem;
        font-weight: bold;
        letter-spacing: 0.15em;
        text-transform: uppercase;
        display: flex;
        align-items: center;
      }

      .center * {
        z-index: 2;
      }

      .button-container {
        padding-top: var(--lumo-space-l);
        display: flex;
        justify-content: space-evenly;
        align-items: flex-end;
        
      }

      .button-with-label {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content:space-between;

      }

      .label > simple-chip {
        height: 16px;
        font-size: var(--lumo-font-size-xs);
      }

      .label {
        display: flex;
        align-items: center;
      }

      @keyframes crawlingWall {
        to {
          background-position-y: bottom;
        }
      }
    `;
  }

  @state()
  loggedInUser: User | null | undefined;

  @state()
  disableDraftButton = false;

  async onBeforeEnter() {
    FirebaseService.auth?.onAuthStateChanged(async (user) => {
      this.loggedInUser = user;
    });
  }

  async startServerDraft() {
    try {
      const user = FirebaseService.auth.currentUser;

      if (!user) {
        throw new Error('User not logged in.');
      }

      this.disableDraftButton = true;

      const deckDraftServerEngine = await DeckDraftFactory.createServerEngine(
        user
      );
      const sessionId = `${deckDraftServerEngine.sessionId}`;

      Router.go(`/deck-drafter/${encodeURIComponent(sessionId)}`);
    } catch (error) {
      console.error('Error creating draft session:', error);
      this.disableDraftButton = false;
    }
  }

  async startClientDraft() {
    try {
      await DeckDraftFactory.createClientEngine();
      const sessionId = `local`;
      Router.go(`/deck-drafter/${encodeURIComponent(sessionId)}`);
    } catch (error) {
      console.error('Error creating draft session:', error);
    }
  }

  render(): TemplateResult {
    const clientSideDisabledButton = this.disableDraftButton;

    let serverButtonText = 'Marshal Your Forces';
    let clientButtonText = serverButtonText;

    if (this.disableDraftButton) {
      serverButtonText = 'Starting Draft...';
      clientButtonText = serverButtonText;
    }

    if (!this.loggedInUser) {
      serverButtonText = 'Please Login';
    }

    return html`
      <section>
        <div class="crawl"></div>
      </section>

      <div class="card center">
        <div class="header">
          <img src=${WaryesImage} alt="WarYes Logo" />
          <h2 style="margin: 0">Deck Draft</h2>
        </div>
        <div>
          <p>
            Welcome to the WarYes Deck Draft! In this mode, you will be drafting
            a division to use in Warno.
          </p>
          <p>
            You will be presented with a series of choices. First starting with
            your division, you will be given 3 options to choose from. From then
            on you will be picking units one at a time until you feel it is
            ready. The transport and veterancy of your units will be prepicked.
          </p>
          <p>
            Once you are done, you will be given the deck code which you can
            import in to the game.
          </p>
        </div>
        <div class="button-container">
          <div class="button-with-label">
            <vaadin-button
              theme="primary large"
              ?disabled="${clientSideDisabledButton}"
              @click="${() => {
                this.startClientDraft();
              }}"
            >
              ${clientButtonText}
            </vaadin-button>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'deck-drafter-route': DeckDrafterRoute;
  }
}
