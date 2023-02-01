import {LitElement, html, TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import '@vaadin/icon';
import '@vaadin/dialog';
import {dialogFooterRenderer, dialogRenderer} from '@vaadin/dialog/lit.js';
import {Unit} from '../../types/unit';
import {Pack} from '../../types/deck-builder';
import {Deck} from '../../classes/deck';
import './transport-card';

@customElement('transport-selection')
export class TransportSelection extends LitElement {
  render(): TemplateResult {
    return this.renderTransportSelection();
  }

  @property()
  pack?: Pack;

  @property()
  deck?: Deck;

  get availableTransports(): Unit[] | undefined {
    if(this.deck && this.pack) {
      return this.deck.getTransportsForPack(this.pack) ;
    }
    return []
  }

  public showTransportDialog() {
    this.showing = true;
  }
  public closeTransportDialog() {
    this.showing = false;
  }

  @state()
  private showing = false;

  renderTransportSelection() {
    if (this.availableTransports && this.availableTransports.length > 0 && this.deck && this.pack) {

      return html` <vaadin-dialog
        header-title="Select Transport"
        ${dialogRenderer(
          () =>
            html`${this.availableTransports?.map(
              (transport) =>
                html`<transport-card
                .unit=${transport}
                .pack=${this.pack}
                .deck=${this.deck}
                  style="margin-bottom: var(--lumo-space-s);"
                  @add-button-clicked=${() =>
                    this.dispatchEvent(
                      new CustomEvent('transport-selected', {
                        detail: {transport: transport},
                      })
                    )}
                ></transport-card>`
            )}`,
          []
        )}
        ${dialogFooterRenderer(
          () =>
            html`<vaadin-button @click="${this.closeTransportDialog}"
              >Cancel</vaadin-button
            > `,
          []
        )}
        .opened="${this.showing}"
      ></vaadin-dialog>`;
    }

    return html``;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'transport-selection': TransportSelection;
  }
}
