import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {Division} from '../../types/deck-builder';
import './deck-draft-button';

@customElement('deck-draft-division-picker')
export class DeckDraftDivisionPicker extends LitElement {
  static get styles() {
    return css`
      :host {
        width: 100%;
      }

      division-flag {
        width: 50%;
      }

      @keyframes typing {
        from {
          width: 0;
        }
        to {
          width: 100%;
        }
      }

      /* The typewriter cursor effect */

      .instruction > * {
        overflow: hidden; /* Ensures the content is not revealed until the animation */
        white-space: nowrap; /* Keeps the content on a single line */
        margin: 0 auto; /* Gives that scrolling effect as the typing happens */
        letter-spacing: 0.15em; /* Adjust as needed */
        animation: typing 3.5s steps(40, end),
          blink-caret 0.75s step-end infinite;
        max-width: 320px;
        text-align: center;
        font-size: var(--lumo-font-size-xl);
        padding: var(--lumo-space-m);
        border: 1px solid var(--lumo-primary-color-50pct);
        background-color: var(--lumo-contrast-5pct);
        margin-bottom: var(--lumo-space-m);
      }

      .divisions {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: var(--lumo-space-m);
      }

      /* fade in and when they are done fading in, give them a little bounce and wiggle */

      @keyframes fadeAndZoom {
        0% {
          opacity: 0;
          transform: scale(0.5);
        }
        80% {
          transform: scale(1.05);
        }
        100% {
          opacity: 1;
          transform: scale(1);
        }
      }

      @keyframes highlight {
        0% {
          border-color: var(--lumo-primary-color-50pct);
        }
        50% {
          border-color: var(--lumo-primary-color-100pct);
        }

        100% {
          border-color: var(--lumo-primary-color-50pct);
        }
      }

      /* Fade in, then bounce and wiggle */
      /* Each division happens slightly after the other */
      .division-1 {
        animation: fadeAndZoom 0.25s ease-in-out 1;
      }

      .division-2 {
        animation: fadeAndZoom 0.25s ease-in-out 0.25s 1;
      }

      .division-3 {
        animation: fadeAndZoom 0.25s ease-in-out 0.5s 1;
      }

      .division {
        opacity: 0;
        animation-fill-mode: forwards;
        border: 3px solid var(--lumo-primary-color-50pct);
        flex: 1 1 100%;
      }

      deck-draft-button {
        max-width: 400px;
      }
    `;
  }

  @property({type: Array})
  choices: string[] = [];

  @state()
  divisions: Division[] = [];

  @property()
  disable = false;

  chooseDivision(choice: number) {
    this.dispatchEvent(
      new CustomEvent('division-chosen', {
        detail: {
          choice,
        },
      })
    );
  }

  render(): TemplateResult {
    return html`
      <div class="instruction"><h2>CHOOSE A DIVISION</h2></div>
      <audio id="sound">
        <source src="/draw.wav" type="audio/wav" />
        <!-- Add additional <source> elements for other audio formats (e.g., OGG, WAV) -->
      </audio>
      <div class="divisions">
        ${this.choices.map(
          (division, index) => html`
            ${this.renderDivisionButton(division, index)}
          `
        )}
      </div>
    `;
  }

  renderDivisionButton(
    divisionDescriptor: string,
    index: number
  ): TemplateResult {
    const division = this.divisions.find(
      (div) => div.descriptor === divisionDescriptor
    );

    console.log(this.disable);
    return html`
      <deck-draft-button
        ?disabled=${this.disable}
        class="division division-${index + 1}"
        @animationend=${() => {
          const sound = this.shadowRoot?.getElementById(
            'sound'
          ) as HTMLAudioElement;
          sound.volume = 0.1;
          sound.currentTime = 0; // Reset the audio to the beginning before each play
          sound.play();
        }}
        @click=${() => {
          this.chooseDivision(index);
        }}
      >
        <division-flag .division=${division}></division-flag>
        <h2>${division?.name}</h2>
      </deck-draft-button>

    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'deck-draft-division-picker': DeckDraftDivisionPicker;
  }
}