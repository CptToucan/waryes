import { html, TemplateResult, css, CSSResultGroup } from "lit";
import { customElement } from "lit/decorators.js";
import { Deck, DeckUnit } from "../../classes/deck";
import { DeckView } from "../deck/deck-view";

@customElement("deck-draft-deck-display")
export class DeckDraftDeckDisplay extends DeckView {

  // extend styles
  static get styles() {
    return [
      DeckView.styles,
      css`
      .deck-category-cards {
        grid-gap: var(--lumo-space-xs);
      }
      `
    ] as CSSResultGroup; 
  }

  renderDeckCard(deckUnit: DeckUnit, deck: Deck): TemplateResult<1> {
    return html`
      <compact-armoury-card .pack=${deckUnit.pack} .transport=${deckUnit.transport}  .deck=${deck}></compact-armoury-card>
    `;
  }

  renderActionsMenu(): TemplateResult {
    return html``;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "deck-draft-deck-display": DeckDraftDeckDisplay;
  }
}