import {css, CSSResultGroup, html, LitElement, TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import '@vaadin/icon';
// import {Pack} from '../../types/deck-builder';
import {Unit} from '../../types/unit';
import '@vaadin/dialog';
import {getIconForUnit} from '../../utils/get-icon-for-unit';
import {getQuantitiesForUnitVeterancies} from '../../utils/get-quantities-for-unit-veterancies';
import {getIconForVeterancy} from '../../utils/get-icon-for-veterancy';
// import {dialogFooterRenderer, dialogRenderer} from '@vaadin/dialog/lit.js';

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
  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
    }
    .main {
      background-color: var(--lumo-contrast-5pct);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: stretch;

      border-radius: var(--lumo-border-radius-m);
      padding-left: var(--lumo-space-xs);
      padding-right: var(--lumo-space-xs);
      padding-top: var(--lumo-space-xs);
      padding-bottom: var(--lumo-space-xs);
      overflow: hidden;

      color: white;
    }

    .main.disabled {
      opacity: 50%;
    }

    .body {
      width: 100%;
      display: flex;
      flex-direction: row;
    }

    .veterancy {
      display: flex;
      flex-direction: row;
      width: 100%;
    }

    .veterancy > div:not(:last-child) {
      border-right: 1px solid var(--lumo-contrast-10pct);
    }

    .veterancy > div {
      flex: 1 1 100%;
      text-align: center;
      padding: var(--lumo-space-xs);
      cursor: pointer;
      border: 1px solid transparent;
    }

    .veterancy > div.active {
      background-color: var(--lumo-contrast-10pct);
      border: 1px solid var(--lumo-primary-color-50pct);
    }

    .veterancy > div.disabled {
      opacity: 20%;
      cursor: initial;
      pointer-events: none;
    }

    .main.disabled .veterancy > div {
      pointer-events: none !important;
    }

    .points {
      position: absolute;
      bottom: 0;
      right: 0;
      color: var(--lumo-primary-color);
    }

    .add-button {
      position: absolute;
      top: 0;
      left: 0;
      margin: 0;
    }

    .info-icon {
      position: absolute;
      top: 4px;
      right: 4px;
      color: var(--lumo-contrast-70pct);
      height: 18px;
      width: 18px;
    }

    .name {
      margin-left: var(--lumo-space-l);
      margin-right: var(--lumo-space-l);
      font-size: 12px;
      display: flex;
      align-items: center;
      text-align: center;
      height: 30px;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .quantity {
      position: absolute;
      bottom: 0;
      left: 0;
      color: var(--lumo-contrast-70pct);
    }

    .top-section {
      display: flex;
      position: relative;
      align-items: center;
      justify-content: center;
      padding-top: var(--lumo-space-xs);
      width: 100%;
      border-bottom: 1px solid var(--lumo-contrast-10pct);
    }

    .bottom-section {
      display: flex;
      position: relative;
      align-items: space-between;
      justify-content: center;
      width: 100%;
      flex: 1 1 100%;
      border-bottom: 1px solid var(--lumo-contrast-10pct);
    }

    .remaining {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      color: var(--lumo-contrast-70pct);

    }
  ` as CSSResultGroup;

  @property()
  options?: ArmouryCardOptions;

  @state()
  selectedVeterancy?: number;

  @property()
  remaining = 0;

  @property()
  hideRemaining = false;

  @property()
  disabled = false;

  clickedAddButton(unit: Unit, veterancy?: number) {
    this.dispatchEvent(
      new CustomEvent('add-button-clicked', {
        detail: {unit, veterancy},
      })
    );
  }

  veterancySelected(veterancy: number) {
    this.selectedVeterancy = veterancy;
    this.dispatchEvent(new CustomEvent("veterancy-changed", { detail: {veterancy}}))
  }

  render(): TemplateResult {
    if (this.options) {
      const unit: Unit = this.options.unit;

      let veterancySelectionRender: TemplateResult = html``;
      let quantityDisplaySelection: TemplateResult = html``;
      let activeVeterancy: number | undefined = undefined;

      if (this.options?.veterancyOptions) {
        const unitVeterancyQuantityMultipliers =
          this.options.veterancyOptions.unitQuantityMultipliers;
        const defaultVeterancy = findDefaultVeterancy(
          unitVeterancyQuantityMultipliers
        );

        // This is the veterancy to use when firing the add action
        activeVeterancy = defaultVeterancy;

        if (this.selectedVeterancy !== undefined) {
          activeVeterancy = this.selectedVeterancy;
        }

        const numberOfUnitsInPacksAfterXPMultiplier =
          getQuantitiesForUnitVeterancies(this.options.veterancyOptions);

        veterancySelectionRender = this.renderVeterancySelection(
          activeVeterancy,
          numberOfUnitsInPacksAfterXPMultiplier
        );
        quantityDisplaySelection = this.renderQuantity(
          activeVeterancy,
          numberOfUnitsInPacksAfterXPMultiplier
        );
      }

      return html`
        <div class="main ${this.disabled ? 'disabled' : ''}">
          <div class="body">
            <div class="top-section">
              ${this.renderButton(unit, this.disabled, activeVeterancy)}
              ${this.renderCommandPoints(unit)} ${this.renderInfoIcon(unit)}
              ${this.renderUnitIcon(unit)} ${quantityDisplaySelection}
            </div>
          </div>
          ${this.renderBottomSection(unit, veterancySelectionRender)}
        </div>
      `;
    }

    return html`ERROR`;
  }

  renderBottomSection(unit: Unit, veterancySelectionRender: TemplateResult) {
    return html` <div class="bottom-section">
        ${this.hideRemaining ? html`` : html`<div class="remaining">(${this.remaining})</div>`}
        <div class="name">${unit?.name}</div>
      </div>
      ${veterancySelectionRender}`;
  }

  renderVeterancySelection(
    activeVeterancy: number,
    numberOfUnitsInPacksAfterXPMultiplier: number[]
  ) {
    return html`<div class="veterancy">
      ${[0, 1, 2, 3].map((_, index) => {
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

  renderQuantity(
    activeVeterancy: number,
    numberOfUnitsInPacksAfterXPMultiplier: number[]
  ) {
    return html`<div class="quantity">
      x${numberOfUnitsInPacksAfterXPMultiplier[activeVeterancy]}
    </div>`;
  }

  renderButton(unit: Unit, disabled: boolean, activeVeterancy?: number) {
    return html` <vaadin-button
      class="add-button"
      ?disabled=${disabled}
      theme="icon medium secondary"
      aria-label="Add unit"
      style="padding: 0;"
      @click=${() => this.clickedAddButton(unit, activeVeterancy)}
    >
      <vaadin-icon icon="vaadin:plus"></vaadin-icon>
    </vaadin-button>`;
  }

  renderCommandPoints(unit: Unit) {
    return html` <div class="points">${unit?.commandPoints}</div>`;
  }

  renderInfoIcon(_unit: Unit) {
    return html` <vaadin-icon
      class="info-icon"
      icon="vaadin:info-circle-o"
    ></vaadin-icon>`;
  }

  renderUnitIcon(unit: Unit) {
    const icon = getIconForUnit(unit);

    return html` <vaadin-icon
      style="font-size: 48px;"
      icon="${icon}"
    ></vaadin-icon>`;
  }
}
function findDefaultVeterancy(unitVeterancyQuantityMultipliers: number[]) {
  return unitVeterancyQuantityMultipliers.findIndex(
    (multiplier) => multiplier === 1
  );
}


declare global {
  interface HTMLElementTagNameMap {
    'armoury-card': ArmouryCard;
  }
}
