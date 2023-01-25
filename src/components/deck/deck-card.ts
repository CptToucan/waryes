import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@vaadin/icon';
import {SelectedPackConfigs} from './edit-deck';
import {getIconForUnit} from '../../utils/get-icon-for-unit';
import {getQuantitiesForUnitVeterancies} from '../../utils/get-quantities-for-unit-veterancies';
import { getIconForVeterancy } from '../../utils/get-icon-for-veterancy';
@customElement('deck-card')
export class DeckCard extends LitElement {
  static get styles() {
    return css`
      :host {
        background-color: var(--lumo-contrast-5pct);
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        border-radius: var(--lumo-border-radius-m);
        padding-left: var(--lumo-space-s);
        padding-right: var(--lumo-space-s);
        padding-top: var(--lumo-space-s);
        padding-bottom: var(--lumo-space-s);
        overflow: hidden;
        height: 32px;
        cursor: pointer;
      }

      .start-section,
      .end-section {
        display: flex;
        flex-direction: row;
        align-items: center;
      }

      .end-section {
        justify-content: space-between;
      }

      :host(:hover) {
        background-color: var(--lumo-contrast-10pct);
      }

      vaadin-icon {
        font-size: 24px;
      }

      .points {
        padding-left: var(--lumo-space-s);
        padding-right: var(--lumo-space-s);
        color: var(--lumo-primary-color);
      }

      .name {
        padding-left: var(--lumo-space-s);
        padding-right: var(--lumo-space-s);
        color: var(--lumo-contrast);
      }

      .quantity {
        color: var(--lumo-contrast);
        width: 2rem;
        text-align: end;
      }
    `;
  }

  @property()
  packConfig?: SelectedPackConfigs;

  render(): TemplateResult {
    if (this.packConfig) {
      const unit = this.packConfig.unit;

      const unitQuantityForVeterancies = getQuantitiesForUnitVeterancies({
        defaultUnitQuantity: this.packConfig.pack.numberOfUnitsInPack,
        unitQuantityMultipliers:
          this.packConfig.pack.numberOfUnitInPackXPMultiplier,
      });

      const unitQuantity = unitQuantityForVeterancies[this.packConfig.veterancy];
      // const transport = this.packConfig.transport;
      const veterancy = this.packConfig.veterancy;

      return html`
        <div class="start-section">
          <vaadin-icon icon=${getIconForUnit(unit)}></vaadin-icon>
          <div class="points">${unit.commandPoints}</div>
          <div class="name">${unit.name}</div>
        </div>
        <div class="end-section">
          ${getIconForVeterancy(veterancy)}
          <div class="quantity">x${unitQuantity}</div>
        </div>
      `;
    }

    return html`ERROR`;
  }
}
