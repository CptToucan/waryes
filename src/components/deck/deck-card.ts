import {css, LitElement, TemplateResult, html} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';
import {Deck, DeckUnit} from '../../classes/deck';
import './armoury-with-transport-card';
import {TransportSelection} from './transport-selection';
import './transport-selection';
import {Unit} from '../../types/unit';

@customElement('deck-card')
export class DeckCard extends LitElement {
  static get styles() {
    return css``;
  }

  @property({
    hasChanged(_value: Deck, _oldValue: Deck) {
      return true;
    },
  })
  deck?: Deck;
  deckUnit?: DeckUnit;

  @query('transport-selection')
  transportDialog!: TransportSelection;

  openTransportDialog() {
    this.transportDialog.showTransportDialog();
  }

  closeTransportDialog() {
    this.transportDialog.closeTransportDialog();
  }

  transportSelected(_transport: Unit) {
    if(this.deckUnit) {
      this.deckUnit.transport = _transport;
      this.transportDialog.closeTransportDialog();
      this.requestUpdate();
    }
  }

  veterancyChanged(veterancy: number) {
    if(this.deckUnit) {
      this.deckUnit.veterancy = veterancy;
      this.deck?.deckChanged();
      this.requestUpdate();
    }
  }

  unitRemoved() {
    if(this.deck && this.deckUnit) {
      this.deck.removeUnit(this.deckUnit);
      this.requestUpdate();
    }
  }

  render(): TemplateResult {
    return html` <transport-selection
        .pack=${this.deckUnit?.pack}
        .deck=${this.deck}
        @transport-selected=${(event: CustomEvent) =>
          this.transportSelected(event.detail.transport)}
      ></transport-selection>
      <armoury-with-transport-card
        .deck=${this.deck}
        .pack=${this.deckUnit?.pack}
        .transport=${this.deckUnit?.transport}
        .selectedVeterancy=${this.deckUnit?.veterancy}
        @transport-change-clicked=${() => this.openTransportDialog()}
        @veterancy-changed=${(event: CustomEvent) => this.veterancyChanged(event.detail.veterancy)}
        @unit-removed=${() => this.unitRemoved()}
      ></armoury-with-transport-card>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'deck-card': DeckCard;
  }
}
