import {css, CSSResultGroup, html, LitElement, TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import '@vaadin/icon';
import {Unit} from '../../types/unit';
import '@vaadin/dialog';
import {getIconForVeterancy} from '../../utils/get-icon-for-veterancy';
import {Pack} from '../../types/deck-builder';
import {Deck} from '../../classes/deck';
import {armouryCardStyles} from './armoury-card-styles';
import {DialogOpenedChangedEvent} from '@vaadin/dialog';
import {dialogHeaderRenderer, dialogRenderer} from '@vaadin/dialog/lit.js';
import '@vaadin/dialog';
import '../unit-card';
import {getIconForTrait} from '../../utils/get-icon-for-trait';
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
  static styles: CSSResultGroup = [armouryCardStyles, css``];

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

  @property({
    hasChanged() {
      return true;
    },
  })
  pack?: Pack;

  @property({
    hasChanged(_value: Deck, _oldValue: Deck) {
      return true;
    },
  })
  deck?: Deck;

  @state()
  unitDialogOpened = false;

  private open() {
    this.unitDialogOpened = true;
  }

  private close() {
    this.unitDialogOpened = false;
  }

  veterancySelected(veterancy: number) {
    this.selectedVeterancy = veterancy;
    this.dispatchEvent(
      new CustomEvent('veterancy-changed', {detail: {veterancy}})
    );
  }

  get activeVeterancy() {
    if (this.deck && this.pack) {
      const defaultVeterancy = this.deck.getDefaultVeterancyForPack(this.pack);
      let activeVeterancy = defaultVeterancy;

      if (this.selectedVeterancy !== undefined) {
        activeVeterancy = this.selectedVeterancy;
      }

      return activeVeterancy;
    }

    return 0;
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

    return html`<div class="main ${this.disabled ? 'disabled' : ''}">
      <div class="traits">
        ${unit.specialities.length > 1
          ? unit.specialities.slice(1).map((trait) => getIconForTrait(trait))
          : 'No Traits'}
      </div>
      <div class="body">
        <div class="top-section">
          ${this.renderButton(this.activeVeterancy, unit, pack, deck)}
          ${this.renderCommandPoints(unit, pack, deck)}
          ${this.renderInfoIcon(unit, pack, deck)}
          ${this.renderUnitIcon(unit, pack, deck)}
          ${this.renderQuantity(
            this.activeVeterancy,
            veterancyQuantities,
            unit
          )}
        </div>
      </div>
      ${this.renderBottomSection(
        this.activeVeterancy,
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
        ?disabled=${this.disabled}
        theme="icon small primary"
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

  renderInfoIcon(
    _unit: Unit,
    _pack: Pack,
    _deck: Deck,
    openCallback?: () => void
  ) {
    return html`
      <vaadin-button
        theme="primary small icon"
        class="info-icon-button"
        @click=${() => {
          console.log(openCallback);
          if (openCallback) {
            openCallback();
          } else {
            this.open();
          }
        }}
        aria-label="Show unit info"
        style="padding: 0;"
      >
        <vaadin-icon icon="vaadin:info-circle-o"></vaadin-icon
      ></vaadin-button>

      ${openCallback ? `` : this.renderUnitModal(_unit)}
    `;
  }

  renderUnitIcon(unit: Unit, _pack: Pack, _deck: Deck) {
    return html`<unit-image .unit=${unit}></unit-image>`;
  }

  renderUnitModal(_unit: Unit) {
    return html`<vaadin-dialog
      aria-label="Add note"
      draggable
      modeless
      resizable
      .opened="${this.unitDialogOpened}"
      @opened-changed="${(event: DialogOpenedChangedEvent) => {
        this.unitDialogOpened = event.detail.value;
      }}"
      ${dialogHeaderRenderer(
        () => html`
          <div class="display: flex; justify-content: flex-end;">
            <vaadin-button @click="${this.close}" theme="tertiary icon"
              ><vaadin-icon icon="vaadin:close"></vaadin-icon
            ></vaadin-button>
          </div>
        `,
        []
      )}
      ${dialogRenderer(
        () => html`<unit-card .unit=${_unit}></unit-card> `,
        [_unit]
      )}
    ></vaadin-dialog>`;
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
        return this.renderVeterancyButton(
          numberOfUnitsInPacksAfterXPMultiplier,
          index,
          activeVeterancy
        );
      })}
    </div>`;
  }

  private renderVeterancyButton(
    numberOfUnitsInPacksAfterXPMultiplier: number[],
    veterancyIndex: number,
    activeVeterancy: number
  ) {
    const isDisabled =
      numberOfUnitsInPacksAfterXPMultiplier[veterancyIndex] === 0;

    return html`<div
      role="button"
      aria-label="veterancy ${veterancyIndex}"
      @click=${() => this.veterancySelected(veterancyIndex)}
      class="${activeVeterancy === veterancyIndex ? 'active' : ''} ${isDisabled
        ? 'disabled'
        : ''}"
    >
      ${getIconForVeterancy(veterancyIndex)}
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'armoury-card': ArmouryCard;
  }
}
