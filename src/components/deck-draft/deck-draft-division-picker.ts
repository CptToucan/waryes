import {css, html, LitElement, TemplateResult} from 'lit';
import {
  customElement,
  property,
  state,
  queryAll,
  query,
} from 'lit/decorators.js';
import {Division} from '../../types/deck-builder';
import './deck-draft-button';
import anime from 'animejs/lib/anime.es.js';

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

      h2 {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        width: 100%;
        text-align: center;
      }

      .instruction {
        margin-bottom: var(--lumo-space-l);
      }

      .instruction > * {
        overflow: hidden; /* Ensures the content is not revealed until the animation */
        white-space: nowrap; /* Keeps the content on a single line */
        margin: 0 auto; /* Gives that scrolling effect as the typing happens */
        letter-spacing: 0.15em; /* Adjust as needed */
        text-align: center;
        font-size: var(--lumo-font-size-xxl);
        font-weight: bold;
        padding: var(--lumo-space-m);
      }

      .divisions {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: var(--lumo-space-m);
        position: relative;
      }

      .division {
        animation-fill-mode: forwards;
        flex: 1 1 100%;
        width: 33%;
        display: flex;
        max-width: 400px;
        flex-direction: column;
      }

      .deck-draft-card {
        display: flex;
        flex-direction: column;
        align-items: center;
      }
    `;
  }

  @queryAll('.division')
  divs?: HTMLDivElement[];

  @query('.division')
  div?: HTMLDivElement;

  firstUpdated() {
    anime({
      targets: this.divs,
      translateX: [-100, 0],
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

  @property({type: Array})
  choices: string[] = [];

  @state()
  divisions: Division[] = [];

  @property()
  disable = false;

  chooseDivision(choice: number) {
    this.disable = true;
    this.playAnimation(choice);

    // delay by 250 ms

    setTimeout(() => {
      this.dispatchEvent(
        new CustomEvent('division-chosen', {
          detail: {
            choice,
          },
        })
      );
    }, 500);
  }

  playAnimation(index: number) {
    // get divisions and play animation
    const divisions = this.shadowRoot?.querySelectorAll(
      '.division'
    ) as NodeListOf<HTMLDivElement>;

    // query the divisions that werent clicked
    const possibleIndexes = [0, 1, 2];
    const indexes = possibleIndexes.filter((i) => i !== index);
    // get the divisions that were not clicked
    const otherDivisions = indexes.map((i) => divisions[i]);

    // get the division that was clicked
    const division = divisions[index];
    const directions = [1, 0, -1];

    anime({
      targets: division,
      duration: 1000,
      translateX: {
        value: `${directions[index] * 100}%`,
      },
      translateY: {
        value: "20%",
      },
      scale: {value: 1.5},
      rotate: '1turn',
    });

    anime({
      targets: otherDivisions,
      duration: 1000,
      opacity: 0,
    });
  }

  render(): TemplateResult {
    return html`
      <div class="instruction">
        <h2>CHOOSE A DIVISION</h2>
      </div>
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

    return html`
      <div class="division division-${index + 1}">
        <div class="deck-draft-card">
          <division-flag .division=${division}></division-flag>
          <h2>${division?.name}</h2>
        </div>

        ${this.disable
          ? html``
          : html`      <vaadin-button
          ?disabled=${this.disable}
          theme="primary large"
          @click=${() => this.chooseDivision(index)}
        >
          Select
        </vaadin-button>
      </div>`}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'deck-draft-division-picker': DeckDraftDivisionPicker;
  }
}

/*

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

      */
