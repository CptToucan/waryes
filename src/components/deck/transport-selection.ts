import {LitElement, html, TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import '@vaadin/icon';
import '@vaadin/dialog';
import {dialogFooterRenderer, dialogRenderer} from '@vaadin/dialog/lit.js';
// import type {DialogOpenedChangedEvent} from '@vaadin/dialog';
import {ArmouryCardOptions} from './armoury-with-transport-card';
import {Unit} from '../../types/unit';

export interface TranpostSelectionOptions {
  open: boolean,
  transport: Unit
}

@customElement('transport-selection')
export class TransportSelection extends LitElement {
  render(): TemplateResult {
    return this.renderTransportSelection();
  }

  @property()
  availableTransports?: ArmouryCardOptions[];

  public showTransportDialog() {
    this.showing = true
  }
  public closeTransportDialog() {
    this.showing = false;
  }

  @state()
  private showing = false;


  renderTransportSelection() {
    if (this.availableTransports && this.availableTransports.length > 0) {
      return html` <vaadin-dialog

        header-title="Select Transport"
        
        ${dialogRenderer(
          () =>
            html`${this.availableTransports?.map(
              (options) =>
                html`<armoury-card
                  style="margin-bottom: var(--lumo-space-s);"
                  .options=${options}
                  @add-button-clicked=${() =>
                    this.dispatchEvent(
                      new CustomEvent('transport-selected', {
                        detail: {transport: options.unit},
                      })
                    )}
                ></armoury-card>`
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
    'transport-selection': TransportSelection
  }
}

/**
 * @opened-changed="${(e: DialogOpenedChangedEvent) =>
          e.detail.value === false ? this.closeTransportDialog() : null}"
 */