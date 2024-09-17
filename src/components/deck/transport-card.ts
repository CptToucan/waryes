import {CSSResultGroup, html, TemplateResult} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {Unit} from '../../types/unit';
import {ArmouryCard} from './armoury-card';
import { Pack } from '../../types/deck-builder';
import { Deck } from '../../classes/deck';

/**
 * Card that is displayed in the main section of the deck builder. It shows an icon, and gives the ability to select veterancy.
 */
@customElement('transport-card')
export class TransportCard extends ArmouryCard {
  static styles: CSSResultGroup = [ArmouryCard.styles];

  @property()
  unit?: Unit;

  render() {
    if (this.pack && this.deck && this.unit) {
      const unit = this.unit;
      return this.renderDetailsForUnit(unit, this.pack, this.deck);
    }

    if(this.pack && this.deck) {
    return this.renderEmptyTransportCard(this.pack, this.deck);
    }

    return html`NO DETAILS FOR TRANSPORT`;
  }

  renderEmptyTransportCard(pack: Pack, deck: Deck): TemplateResult<1> {
    return html`<div class="main ${this.disabled ? 'disabled' : ''}">
    <div class="traits">

    </div>
    <div class="body">
      <div class="top-section">
        ${this.renderButton(this.activeVeterancy, undefined, pack, deck)}
      </div>
    </div>
    <div class="bottom-section">
          <div class="name">NO TRANSPORT</div>
        </div>
  </div>`;
  }

  renderVeterancySelection(): TemplateResult<1> {
    return html``;
  }

  renderRemainingQuantity(): TemplateResult<1> {
    return html``;
  }

  renderQuantity(): TemplateResult<1> {
    return html``;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'transport-card': TransportCard;
  }
}
