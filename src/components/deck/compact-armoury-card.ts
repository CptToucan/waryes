import {customElement /*, property*/} from 'lit/decorators.js';
import {html, css, TemplateResult} from 'lit';
import {ArmouryWithTransportCard} from './armoury-with-transport-card';
import {getIconForVeterancy} from '../../utils/get-icon-for-veterancy';
import { Deck } from '../../classes/deck';

@customElement('compact-armoury-card')
export class CompactArmouryCard extends ArmouryWithTransportCard {
  static styles = [
    css`
      .main {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        position: relative;
        width: 100%;
        height: 100%;
        border-radius: var(--lumo-border-radius-m);
        overflow: hidden;
        flex: 1 1 0;
      }

      unit-image {
        width: 100%;
        flex: 1 1 100%;
      }

      .details {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        position: absolute;
        bottom: 13px;
        background-color: hsla(240, 7%, 11%, 0.8);
        width: 100%;
        overflow: hidden;
      }

      .name {

        font-size: 9px;
        width: 100%;
        text-align: center;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        margin-left: var(--lumo-space-xs);
        margin-right: var(--lumo-space-xs);
      }

      .unit-name {
        background-color: var(--lumo-contrast-10pct);
        display: flex;
        width: 100%;
        flex: 1 1 0%;
        align-items: center;
        justify-content: center;
        height: 13px;
      }

      .cmd-points {
        position: absolute;
        top: 0;
        right: 0;
        font-size: var(--lumo-font-size-xs);
        padding-left: var(--lumo-space-xs);
        padding-right: var(--lumo-space-xs);
        background-color: hsla(240, 7%, 11%, 0.8);
        border-bottom-left-radius: var(--lumo-border-radius-m);
      }

      .availability {
        position: absolute;
        top: 0;
        left: 0;
        background-color: hsla(240, 7%, 11%, 0.8);
        border-bottom-right-radius: var(--lumo-border-radius-m);
        font-size: var(--lumo-font-size-xs);
        padding-left: var(--lumo-space-xs);
        padding-right: var(--lumo-space-xs);
      }

      .veterancy {
        position: absolute;
        top: 0.5;
        right: 0;
        background-color: hsla(240, 7%, 11%, 0.8);
        border-radius: var(--lumo-border-radius-s);
        padding-left: 2px;
        padding-right: 2px;
      }
    `,
  ];

  render(): TemplateResult {
    if (this.pack && this.deck) {
      const unit = this.deck.getUnitForPack(this.pack);
      const veterancyQuantities = Deck.getVeterancyQuantitiesForPack(
        this.pack
      );

      if (unit) {
        let cmdPoints = unit.commandPoints;

        if (this.transport) {
          cmdPoints += this.transport.commandPoints;
        }

        return html`
          <div class="main">
            <unit-image .unit=${unit}></unit-image>
            <div class="cmd-points">${cmdPoints}</div>
            <div class="availability">
              x${veterancyQuantities[this.activeVeterancy]}
            </div>
            <div class="veterancy">
              ${getIconForVeterancy(this.activeVeterancy)}
            </div>
            ${this.transport?.name
              ? html` <div class="details">
                  <span class="name">${this.transport?.name}</span>
                </div>`
              : ''}

            <div class="unit-name"><span class="name">${unit.name}</span></div>
          </div>
        `;
      }
    }
    return html`NO PACK OR NO DECK`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'compact-armoury-card': CompactArmouryCard;
  }
}
