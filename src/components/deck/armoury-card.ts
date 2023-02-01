import {CSSResultGroup, html, LitElement, TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import '@vaadin/icon';
import {Unit} from '../../types/unit';
import '@vaadin/dialog';
import {getIconForUnit} from '../../utils/get-icon-for-unit';
import {getIconForVeterancy} from '../../utils/get-icon-for-veterancy';
import {Pack} from '../../types/deck-builder';
import {Deck} from '../../classes/deck';
import {armouryCardStyles} from './armoury-card-styles';
import { DeckController } from '../../controllers/deck-controller';

export interface ArmouryCardOptions {
  unit: Unit;
  veterancyOptions?: ArmouryCardVeterancyOptions;
}

export interface ArmouryCardVeterancyOptions {
  unitQuantityMultipliers: number[];
  defaultUnitQuantity: number;
}

/**
 * Card that is displayed in the main section of the deck builder. It shows an icon, and gives the ability to select veterancy.
 */
@customElement('armoury-card')
export class ArmouryCard extends LitElement {
  static styles: CSSResultGroup = [armouryCardStyles];

  constructor() {
    super();
    this.DeckController = new DeckController(this);
  }

  DeckController?: DeckController;

  @state()
  selectedVeterancy?: number;

  @property()
  disabled = false;

  clickedAddButton(unit: Unit, veterancy?: number) {
    this.dispatchEvent(
      new CustomEvent('add-button-clicked', {
        detail: {unit, veterancy},
      })
    );
  }

  @property()
  pack?: Pack;

  @property()
  deck?: Deck;

  veterancySelected(veterancy: number) {
    this.selectedVeterancy = veterancy;
    this.dispatchEvent(
      new CustomEvent('veterancy-changed', {detail: {veterancy}})
    );
  }

  firstUpdated() {
    if(this.deck !== undefined && this.pack && this.DeckController) {
      this.DeckController.initialiseControllerAgainstDeck(this.deck, this.pack)
    }
  }

  render(): TemplateResult {
    if (this.pack && this.deck) {
      const unit = this.deck.getUnitForPack(this.pack);

      if (unit) {
        return this.renderDetailsForUnit(unit, this.pack, this.deck);
      }
    }

    return html`NO PACK OR NO DECK`;
  }

  protected renderDetailsForUnit(unit: Unit, pack: Pack, deck: Deck) {
    const veterancyQuantities = deck.getVeterancyQuantitiesForPack(pack);
    const defaultVeterancy = deck.getDefaultVeterancyForPack(pack);
    let activeVeterancy = defaultVeterancy;

    if (this.selectedVeterancy !== undefined) {
      activeVeterancy = this.selectedVeterancy;
    }

    return html`<div class="main ${this.disabled ? 'disabled' : ''}">
      <div class="body">
        <div class="top-section">
          ${this.renderButton(activeVeterancy, unit, pack, deck)}
          ${this.renderCommandPoints(unit, pack, deck)}
          ${this.renderInfoIcon(unit, pack, deck)}
          ${this.renderUnitIcon(unit, pack, deck)}
          ${this.renderQuantity(activeVeterancy, veterancyQuantities, unit)}
        </div>
      </div>
      ${this.renderBottomSection(
        activeVeterancy,
        veterancyQuantities,
        unit,
        pack,
        deck
      )}
    </div>`;
  }

  renderButton(activeVeterancy: number, unit: Unit, _pack: Pack, _deck: Deck) {
    if (unit) {
      return html` <vaadin-button
        class="add-button"
        ?disabled=${false}
        theme="icon medium secondary"
        aria-label="Add unit"
        style="padding: 0;"
        @click=${() => this.clickedAddButton(unit, activeVeterancy)}
      >
        <vaadin-icon icon="vaadin:plus"></vaadin-icon>
      </vaadin-button>`;
    }
    return html`No unit found`;
  }

  renderCommandPoints(unit: Unit, _pack: Pack, _deck: Deck) {
    return html` <div class="points">${unit?.commandPoints}</div>`;
  }

  renderInfoIcon(_unit: Unit, _pack: Pack, _deck: Deck) {
    return html` <vaadin-icon
      class="info-icon"
      icon="vaadin:info-circle-o"
    ></vaadin-icon>`;
  }

  renderUnitIcon(unit: Unit, _pack: Pack, _deck: Deck) {
    if (unit) {
      const icon = getIconForUnit(unit);

      return html` <vaadin-icon
        style="font-size: 48px;"
        icon="${icon}"
      ></vaadin-icon>`;
    } else {
      return html`<vaadin-icon
        style="font-size: 48px;"
        icon="$vaadin:question"
      ></vaadin-icon>`;
    }
  }

  renderQuantity(
    activeVeterancy: number,
    numberOfUnitsInPacksAfterXPMultiplier: number[],
    _unit: Unit
  ) {
    return html`<div class="quantity">
      x${numberOfUnitsInPacksAfterXPMultiplier[activeVeterancy]}
    </div>`;
  }

  renderBottomSection(
    activeVeterancy: number,
    numberOfUnitsInPacksAfterXPMultiplier: number[],
    unit: Unit,
    pack: Pack,
    deck: Deck
  ) {
    if (unit) {
      return html` <div class="bottom-section">
          ${this.renderRemainingQuantity(pack, deck)}
          <div class="name">${unit.name}</div>
        </div>
        ${this.renderVeterancySelection(
          activeVeterancy,
          numberOfUnitsInPacksAfterXPMultiplier
        )}`;
    } else {
      return html`No unit found`;
    }
  }

  renderRemainingQuantity(pack: Pack, deck: Deck) {
    return html` <div class="remaining">
      (${deck.getAvailableQuantityOfPack(pack)})
    </div>`;
  }

  renderVeterancySelection(
    activeVeterancy: number,
    numberOfUnitsInPacksAfterXPMultiplier: number[]
  ) {
    return html`<div class="veterancy">
      ${numberOfUnitsInPacksAfterXPMultiplier.map((_, index) => {
        // If there are no units available for a veterancy it is not selectable
        const isDisabled = numberOfUnitsInPacksAfterXPMultiplier[index] === 0;

        return html`<div
          role="button"
          @click=${() => this.veterancySelected(index)}
          class="${activeVeterancy === index ? 'active' : ''} ${isDisabled
            ? 'disabled'
            : ''}"
        >
          ${getIconForVeterancy(index)}
        </div>`;
      })}
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'armoury-card': ArmouryCard;
  }
}
