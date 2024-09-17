import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';
import '@vaadin/icon';
import {Pack} from '../../types/deck-builder';
import {Unit} from '../../types/unit';
import '@vaadin/dialog';
import './transport-selection';
import './armoury-card';
import { TransportSelection } from './transport-selection';
import { Deck } from '../../classes/deck';


@customElement('pack-armoury-card')
export class PackArmouryCard extends LitElement {
  static get styles() {
    return css`
      :host {
        max-width: 150px;
      }
    `;
  }

  @property()
  pack?: Pack;

  @property({
    hasChanged(_value: Deck, _oldValue: Deck) {
      return true;
    }
  })
  deck?: Deck;

  @property()
  disabled = false;

  @property()
  remaining = 0;

  @query("transport-selection")
  transportDialog!: TransportSelection 

  selectedUnitVeterancy: number | null = null;

  openTransportDialog(veterancy: number) {
    this.transportDialog.showTransportDialog();
    this.selectedUnitVeterancy = veterancy
  }

  closeTransportDialog() {
    this.transportDialog.closeTransportDialog();
    this.selectedUnitVeterancy = null
  }


  armouryCardSelected(veterancy: number) {
    if (this.pack && this.deck) {
      const transports = this.deck.getTransportsForPack(this.pack);
      const availableWithoutTransports = this.deck.getPackAvailableWithoutTransport(this.pack);

      if ((transports && transports.length > 1 && !availableWithoutTransports) || availableWithoutTransports) {
        this.openTransportDialog(veterancy);
      }
      else if(transports && transports.length === 1 && !availableWithoutTransports) {
        this.deck.addUnit({veterancy, pack: this.pack, transport: transports[0]})
      }
      else {
        this.deck.addUnit({veterancy, pack: this.pack});
      }
    }
  }

  transportSelected(transport: Unit) {
    if(this.pack && this.selectedUnitVeterancy !== null) {
      this.deck?.addUnit({transport, veterancy: this.selectedUnitVeterancy, pack: this.pack})
    }
    this.closeTransportDialog();
  }

  render(): TemplateResult {

    if(this.deck && this.pack) {

      const disabled = this.deck.getAvailableQuantityOfPack(this.pack) > 0 ? false : true; 


      return html`
        <transport-selection .pack=${this.pack} .deck=${this.deck} @transport-selected=${(event: CustomEvent) => this.transportSelected(event.detail.transport)}></transport-selection>
        <armoury-card .pack=${this.pack} .deck=${this.deck} @add-button-clicked=${(event: CustomEvent) => this.armouryCardSelected(event.detail.veterancy)} .disabled=${disabled}></armoury-card>`
    }

    return html`NO DECK SUPPLED OR NO PACK SUPPLIED`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pack-armoury-card': PackArmouryCard;
  }
}

