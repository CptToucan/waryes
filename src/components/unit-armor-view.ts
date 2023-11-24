import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {Unit} from '../types/unit';
import { displayArmor } from '../utils/unit-stats/display-armor';

@customElement('unit-armor-view')
export class UnitArmorView extends LitElement {
  static get styles() {
    return css`
      .armor-section {
        padding: var(--lumo-space-xs);
      }

      p {
        margin: 0;
        padding: 0;
      }

      div.armor-section p.armor-value {
        text-align: center;
        flex-grow: 0;
        flex-shrink: 0;
        justify-content: space-around;
        margin: 0;
        font-size: var(--lumo-font-size-xl);
        color: var(--lumo-contrast);
        font-weight: bold;
      }

      div.armor-section p.armor-name {
        text-align: center;
        font-size: var(--lumo-font-size-s);
        margin-top: 0;
        color: var(--lumo-contrast-70pct);
      }


      vaadin-horizontal-layout {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
      }

      div.unitArmorView {
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
    `;
  }

  @property()
  private unit?: Unit;

  render(): TemplateResult {
    return html`
      <div class="unit-armor-view">
        <vaadin-horizontal-layout style="justify-content: space-around;">
          ${this.renderArmorField('Front', this.unit?.frontArmor  || 0)}
          ${this.renderArmorField('Side', this.unit?.sideArmor || 0)}
          ${this.renderArmorField('Rear', this.unit?.rearArmor || 0)}
          ${this.renderArmorField('Top', this.unit?.topArmor || 0)}
        </vaadin-horizontal-layout>
      </div>
    `;
  }

  renderArmorField(name: string, value: number) {
    const displayValue = displayArmor(value);

    return html`<div class="armor-section">
      <p class="armor-value">${displayValue}</p>
      <p class="armor-name">${name}</p>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'unit-armor-view': UnitArmorView;
  }
}
