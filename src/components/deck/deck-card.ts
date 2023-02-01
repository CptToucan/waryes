/*
import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@vaadin/icon';
import {SelectedPackConfig} from './edit-deck';
import './armoury-with-transport-card';
import {ArmouryCardOptions} from './armoury-with-transport-card';
import { UnitMap } from '../../types/unit';
*/

/**
 * Card that shows in the side drawer for the created deck.
 */
/*
@customElement('deck-card')
export class DeckCard extends LitElement {
  static get styles() {
    return css``;
  }

  @property()
  unitMap?: UnitMap;

  @property()
  packConfig?: SelectedPackConfig;

  render(): TemplateResult {
    if (this.packConfig) {
      const options: ArmouryCardOptions = {
        unit: this.packConfig.unit,
        transport: this.packConfig.transport,
        veterancyOptions: {
          unitQuantityMultipliers:
            this.packConfig.pack.numberOfUnitInPackXPMultiplier,
          defaultUnitQuantity: this.packConfig.pack.numberOfUnitsInPack,
        },
      };

      return html`<armoury-with-transport-card
        .options=${options}
        @veterancy-changed=${(event: CustomEvent) => {this.packConfig!.veterancy = event.detail.veterancy; this.requestUpdate()}}
        @transport-changed=${(event: CustomEvent) => {this.packConfig!.transport = event.detail.transport; this.requestUpdate()}}
        @unit-removed=${() =>
          this.dispatchEvent(
            new CustomEvent('pack-config-removed', {
              detail: {packConfig: this.packConfig},
            })
          )}
         .availableTransports=${this.availableTransportsArmouryCardOptions}
      ></armoury-with-transport-card>`;
    }

    return html`ERROR`;
  }
  
  get availableTransportsArmouryCardOptions(): ArmouryCardOptions[] {
    if (this.packConfig && this.packConfig.pack && this.packConfig.pack.availableTransportList?.length > 0) {
      const transportsOptions: ArmouryCardOptions[] =
        this.packConfig.pack.availableTransportList.map((transportDescriptor) => {
          return {unit: this.unitMap?.[transportDescriptor]};
        }) as ArmouryCardOptions[];

      return transportsOptions;
    }

    return [];
  }
}




declare global {
  interface HTMLElementTagNameMap {
    'deck-card': DeckCard;
  }
}

*/