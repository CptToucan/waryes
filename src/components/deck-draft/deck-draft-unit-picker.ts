import {css, html, LitElement, PropertyValues, TemplateResult} from 'lit';
import {customElement, property, queryAll} from 'lit/decorators.js';
import {Deck} from '../../classes/deck';
import {PackChoice} from '../../routes/deck-draft';
import {Unit} from '../../types/unit';
import './deck-draft-button';
import './deck-draft-unit-select-card';
import anime from 'animejs/lib/anime.es.js';

@customElement('deck-draft-unit-picker')
export class DeckDraftUnitPicker extends LitElement {
  static get styles() {
    return css`
      :host {
        width: 100%;
        overflow: hidden;
      }
      .instruction {
        margin-bottom: var(--lumo-space-s);
      }

      .instruction > * {
        overflow: hidden; /* Ensures the content is not revealed until the animation */
        white-space: nowrap; /* Keeps the content on a single line */
        margin: 0 auto; /* Gives that scrolling effect as the typing happens */
        letter-spacing: 0.15em; /* Adjust as needed */
        text-align: center;
        font-size: var(--lumo-font-size-xxl);
        font-weight: bold;
        padding: var(--lumo-space-s);
        padding-bottom: var(--lumo-space-xs);
      }

      .division {
        animation-fill-mode: forwards;
        flex: 1 0 100%;
        margin: 0 auto;
      }

      .divisions {
        display: flex;
        overflow-x: auto; 
        justify-content: flex-start;
        gap: var(--lumo-space-m);
        width: 100%;
        padding-left: var(--lumo-space-m);
        padding-right: var(--lumo-space-m);
        padding-bottom: var(--lumo-space-m);
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

      @media (max-width: 1000px) {
        .deck-draft-card {
          max-width: 300px;
        }
      }


      deck-draft-button {
        max-width: 400px;
      }

      vaadin-button {
        margin-top: var(--lumo-space-s);
      }
    `;
  }

  @queryAll('.division')
  divs?: HTMLDivElement[];

  firstUpdated() {
    this.playAnimation();
  }

  playAnimation() {
    anime({
      targets: this.divs,
      translateX: [-50, 0],
      duration: 1000,
      delay: anime.stagger(250),
      opacity: [0, 1],
      update: (anim) => {
        const sound = this.shadowRoot?.getElementById(
          'sound'
        ) as HTMLAudioElement;
        sound.volume = 0.1;

        // 3 sounds should be played
        // 1. When the first card is shown
        if (anim.progress > 10 && anim.progress < 11) {
          sound.currentTime = 0; // Reset the audio to the beginning before each play
          sound.play();
        }

        // 2. When the second card is shown
        if (anim.progress > 35 && anim.progress < 36) {
          sound.currentTime = 0; // Reset the audio to the beginning before each play
          sound.play();
        }

        // 3. When the third card is shown
        if (anim.progress > 60 && anim.progress < 61) {
          sound.currentTime = 0; // Reset the audio to the beginning before each play
          sound.play();
        }
      },
    });
  }

  updated(changedProperties: PropertyValues<this>) {
    // only need to check changed properties for an expensive computation.
    console.log(changedProperties);
    if (changedProperties.has('disable') && this.disable === false) {
      this.playAnimation();
    }
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
        ${this.choices.map((choice, index) =>
          this.renderUnitButton(choice, index)
        )}
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
          .selectedVeterancy=${choice.veterancy}
        >
        </deck-draft-unit-select-card>
        <vaadin-button
          theme="primary large"
          ?disabled=${this.disable}
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
        ${this.disable
          ? html`<deck-draft-button ?disabled=${true}></deck-draft-button
              ><deck-draft-button ?disabled=${true}></deck-draft-button
              ><deck-draft-button ?disabled=${true}></deck-draft-button>`
          : html`${this.choices.map((choice, index) =>
              this.renderUnitButton(choice, index)
            )}`}       
        */
