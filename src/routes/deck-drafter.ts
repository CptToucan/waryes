import {Router} from '@vaadin/router';
import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {FirebaseService} from '../services/firebase';
// @ts-ignore
import WaryesImage from '../../images/waryes-transparent.png';
import {BeforeEnterObserver} from '@vaadin/router';
import {User} from 'firebase/auth';

@customElement('deck-drafter-route')
export class DeckDrafterRoute
  extends LitElement
  implements BeforeEnterObserver
{
  static get styles() {
    return css`
      :host {
        display: flex;
        align-items: stretch;
        flex: 1 1 100%;
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
        height: calc(100vh - 44px);
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
        padding: var(--lumo-space-l);
      }

      .card::before {
        opacity: 0.9;
        background-color: var(--lumo-base-color);
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border-radius: inherit;
      }

      .center {
        position: absolute;
        top: 20%; /* Move the element 50% down from the top of its parent */
        left: 50%; /* Move the element 50% from the left of its parent */
        transform: translate(-50%, -20%); /* Center the element precisely */
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
        justify-content: center;
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

  async startDraft() {
    try {
      this.disableDraftButton = true;
      const user = FirebaseService.auth.currentUser;
      const response = await fetch(
        `https://europe-west1-catur-11410.cloudfunctions.net/startDeckDraft`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${await user?.getIdToken()}`,
          },
        }
      );

      if (response.ok) {
        console.log(response);
        console.log('Draft session created successfully.');
        // navigate to the draft session
        Router.go(
          `/deck-drafter/${encodeURIComponent(
            (await response.json()).sessionId
          )}`
        );
      } else {
        console.error('Failed to create draft session.');
      }
    } catch (error) {
      console.error('Error creating draft session:', error);
      this.disableDraftButton = false;
    }
  }

  async chooseDivision(sessionId: string, choice: number) {
    try {
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
    } catch (error) {
      console.error('Error choosing division:', error);
    }
  }

  render(): TemplateResult {
    const disabledButton = this.disableDraftButton || !this.loggedInUser;
    let buttonText = 'Marshal Your Forces';

    if (this.disableDraftButton) {
      buttonText = 'Starting Draft...';
    }

    if (!this.loggedInUser) {
      buttonText = 'Please Login';
    }

    return html`
      <section>
        <div class="crawl"></div>
      </section>

      <div class="card center">
        <div class="header">
          <img src=${WaryesImage} alt="WarYes Logo" />
          <span>Deck Draft <simple-chip>BETA</simple-chip></span>
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
          <p>
            The draft is run on a server, this will enable more advanced
            features in the future. To prevent abuse of the server, you will
            unfortunately need to have a WarYes account to use the draft.
          </p>
        </div>
        <div class="button-container">
          <vaadin-button
            theme="primary large"
            ?disabled="${disabledButton}"
            @click="${() => {
              this.startDraft();
            }}"
          >
            ${buttonText}
          </vaadin-button>
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
