import {CSSResultGroup, html, TemplateResult} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import { Unit } from '../../types/unit';
import { ArmouryCard } from './armoury-card';

/**
 * Card that is displayed in the main section of the deck builder. It shows an icon, and gives the ability to select veterancy.
 */
@customElement('transport-card')
export class TransportCard extends ArmouryCard {
  static styles: CSSResultGroup = [ArmouryCard.styles];

  @property()
  unit?:Unit

  render() {
    if(this.pack && this.deck && this.unit) {
      const unit = this.unit;
      return this.renderDetailsForUnit(unit, this.pack, this.deck);
    }

    return html`NO DETAILS FOR TRANSPORT`
  }

  renderVeterancySelection(): TemplateResult<1> {
    return html``;
  }

  renderRemainingQuantity(): TemplateResult<1> {
    return html``;
  }
}



declare global {
  interface HTMLElementTagNameMap {
    'transport-card': TransportCard;
  }
}
