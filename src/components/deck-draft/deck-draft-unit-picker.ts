import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {Deck} from '../../classes/deck';
import {PackChoice} from '../../routes/deck-draft';
import {Unit} from '../../types/unit';
import './deck-draft-button';
import './deck-draft-unit-select-card';

@customElement('deck-draft-unit-picker')
export class DeckDraftUnitPicker extends LitElement {
  static get styles() {
    return css`
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
        flex: 1 1 100%;
      }

      .divisions {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: var(--lumo-space-m);
      }



      img {
        width: 300px;
        overflow: hidden;
      }

      vaadin-icon {
        font-size: 32px;
      }

      .deck-draft-card {
        display: flex;
        max-width: 400px;
        flex-direction: column;
      }

      deck-draft-button {
        max-width: 400px;
      }

      vaadin-button {
        margin-top: var(--lumo-space-s);
      }
    `;
  }

  @property({type: Array})
  choices: PackChoice[] = [];

  @property({type: Array})
  units: Unit[] = [];

  @property()
  disable = false;

  @property()
  deck?: Deck;

  choosePack(choice: number) {
    this.dispatchEvent(
      new CustomEvent('unit-chosen', {
        detail: {
          choice,
        },
      })
    );
  }

  render(): TemplateResult {
    return html`
      <div class="instruction"><h2>PICK A UNIT</h2></div>

      <audio id="sound">
        <source src="/draw.wav" type="audio/wav" />
        <!-- Add additional <source> elements for other audio formats (e.g., OGG, WAV) -->
      </audio>
      <div class="divisions">
        ${this.disable
          ? html`<deck-draft-button ?disabled=${true}></deck-draft-button
              ><deck-draft-button ?disabled=${true}></deck-draft-button
              ><deck-draft-button ?disabled=${true}></deck-draft-button>`
          : html`${this.choices.map((choice, index) =>
              this.renderUnitButton(choice, index)
            )}`}
      </div>
    `;
  }

  renderUnitButton(choice: PackChoice, index: number) {
    const unit = this.units.find(
      (unit) => unit.descriptorName === choice.unit
    ) as Unit;
    const transport = this.units.find(
      (unit) => unit.descriptorName === choice.transport
    );

    const pack = this.deck?.getPackForUnitDescriptor(unit.descriptorName);

    return html`
      <div 
        class="deck-draft-card division division-${index + 1}"
        @animationend=${() => {
          const sound = this.shadowRoot?.getElementById(
            'sound'
          ) as HTMLAudioElement;
          sound.volume = 0.1;
          sound.currentTime = 0; // Reset the audio to the beginning before each play
          sound.play();
        }}
        />

        <deck-draft-unit-select-card
          .pack=${pack}
          .transport=${transport}
          .deck=${this.deck}
        >
        </deck-draft-unit-select-card>
        <vaadin-button
          theme="primary large"
          @click=${() => this.choosePack(index)}
        >
          Add
        </vaadin-button>
      </div>
    `;
  }

  generateSrc(unit: Unit) {
    const descriptorName = unit?.descriptorName || '';
    return `/images/units/${descriptorName}.png`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'deck-draft-unit-picker': DeckDraftUnitPicker;
  }
}

/*
       
        */
