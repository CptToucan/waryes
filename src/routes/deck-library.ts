import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement} from 'lit/decorators.js';
import { Country } from '../types/deck-builder';

export type DeckLibraryItem = {
  name: string;
  description: string;
  division: string;
  deckCode: string;
  votes: number;
  country: Country;
};

@customElement('deck-library-route')
export class DeckLibraryRoute extends LitElement {
  static get styles() {
    return css`
      .container {
        padding-left: var(--lumo-space-s);
        padding-right: var(--lumo-space-s);
        display: flex;
        height: 100%;
      }

      .decks {
        display: flex;
        flex-direction: column;
        gap: var(--lumo-space-s);
        width: 100%;
      }

      .deck {
        display: flex;
        flex-direction: row;
        gap: var(--lumo-space-xs);
        background-color: var(--lumo-contrast-10pct);
        border-radius: var(--lumo-border-radius-m);
        padding: var(--lumo-space-s);
      }
    `;
  }

  decks: DeckLibraryItem[] = [
    {
      name: "Toucan's Deck",
      description: 'This is a test deck',
      division: 'Test Division',
      deckCode: 'Test Deck Code',
      country: Country.US,
      votes: 27
    },
    {
      name: 'Test Deck',
      description: 'This is a test deck',
      division: 'Test Division',
      deckCode: 'Test Deck Code',
      country: Country.US,
      votes: 12
    },
    {
      name: 'Test Deck',
      description: 'This is a test deck',
      division: 'Test Division',
      deckCode: 'Test Deck Code',
      country: Country.US,
      votes: 3
    },
  ];

  render(): TemplateResult {
    return html`<div class="container">
      <div class="decks">
        ${this.decks.map(
          (deck) => html`
            <div class="deck">
              <division-flag
                .division=${{
                  id: 1,
                  name: '3rd Armored',
                  descriptor: 'Descriptor_Deck_Division_US_3rd_Arm_multi',
                }}
              ></division-flag>
              <country-flag
                .country=${deck.country}
              ></country-flag>

              <span> ${deck.name} ${deck.division} </span>
              <span
                style="color: var(--lumo-secondary-text-color); font-size: var(--lumo-font-size-s);"
              >
                TEST
              </span>
            </div>
          `
        )}
      </div>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'deck-library-route': DeckLibraryRoute;
  }
}
