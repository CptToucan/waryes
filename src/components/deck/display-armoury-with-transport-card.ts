import {customElement} from 'lit/decorators.js';
import {html, css} from 'lit';
import {ArmouryWithTransportCard} from './armoury-with-transport-card';
import {getIconForVeterancy} from '../../utils/get-icon-for-veterancy';

@customElement('display-armoury-with-transport-card')
export class DisplayArmouryWithTransportCard extends ArmouryWithTransportCard {
  static styles = [
    ArmouryWithTransportCard.styles,
    css`
      .category-icon {
        font-size: 32px;
      }


      .details-row > span {
        font-size: var(--lumo-font-size-xxs);
      }

      :host {
        font-size: var(--lumo-font-size-xxs);
      }
    `,
  ];
  renderButton() {
    return html``;
  }

  renderTransportSelectionButton() {
    return html``;
  }

  renderInfoIcon() {
    return html`<div class="info-icon-button">
      ${getIconForVeterancy(this.selectedVeterancy || 0)}
    </div>`;
  }

  renderVeterancySelection() {
    return html``;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'display-armoury-with-transport-card': DisplayArmouryWithTransportCard;
  }
}
