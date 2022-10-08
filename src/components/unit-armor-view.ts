import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import { Unit } from "../types/unit";

@customElement('unit-armor-view')
export class UnitArmorView extends LitElement {
  static get styles() {
    return css`

        div.armor-section p.armor-name {
          text-align: center;
          font-size: var(--lumo-font-size-s);
          margin-top: 0;
          color: var(--lumo-contrast);
        }

        div.armor-section p.armor-value {
            text-align: center;
            flex-grow: 0;
            justify-content: space-around;
            padding: var(--lumo-space-m) var(--lumo-space-xl);
            margin: 0;
            font-size: var(--lumo-font-size-xxxl);
            color: var(--lumo-contrast);
        }

        h2 {
          display: block;
          text-align: center;
          font-size: var(--lumo-font-size-xl);
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

        @media (max-width: 768px) {
          vaadin-horizontal-layout {
            flex-wrap: wrap;
          }
          
          div.armor-section p.armor-value { 
            padding: var(--lumo-space-s);
            /* font-size: var(--lumo-font-size-xxl); */
          }

          p.armor-section { 
            width: 40%;
          }
        }
    `;
  }

  @property()
  private unit?: Unit;

  render(): TemplateResult {
    return html`
      <div class="unit-armor-view">
        <vaadin-horizontal-layout theme="">
          ${ this.renderArmorField('Front', this.unit?.frontArmor) }
          ${ this.renderArmorField('Side', this.unit?.sideArmor) }
          ${ this.renderArmorField('Rear', this.unit?.rearArmor) }
          ${ this.renderArmorField('Top', this.unit?.topArmor) }
        </vaadin-horizontal-layout>
      </div>
    `;
  }

  renderArmorField(name: string, value: any) {
    return html`<div class="armor-section">
                  <p class='armor-value'>${value ?? '?'}</p>
                  <p class='armor-name'>${name}</p>
                </div>`;
  }
  
}

