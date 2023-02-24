import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import './unit-armor-view';
import './unit-weapon-view';
import './unit-info-panel-view';
import './trait-badge';
import './unit-image';
import '@vaadin/button';
import {Unit} from '../types/unit';
import {getIconForSpecialty} from '../utils/get-icon-for-specialty';

/**
 * Component for rendering the details of a single unit
 */
@customElement('unit-card')
export class UnitCard extends LitElement {
  static get styles() {
    return css`
      p {
        margin: 0;
        padding: 0;
      }

      :host {
        background-color: var(--lumo-contrast-5pct);
        display: flex;
        flex-direction: column;
        align-items: center;
        border-radius: var(--lumo-border-radius-m);
        padding-left: var(--lumo-space-s);
        padding-right: var(--lumo-space-s);
        padding-top: var(--lumo-space-s);
        padding-bottom: var(--lumo-space-s);
        min-width: 300px;
        flex: 1 1 100%;
      }

      .unit-card {
        width: 100%;
        display: flex;
        flex-direction: column;
        flex: 1 1 100%;
      }

      div.unit-title {
        display: flex;
        flex-direction: 'column';
        width: 100%;
      }

      .top-bar {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
      }

      div.unit-title > p {
        flex-grow: 1;
        font-size: var(--lumo-font-size-l);
        color: var(--lumo-contrast-90pct);
        margin: 0;
      }

      div.unit-title p.unit-command-points {
        text-align: right;
        color: var(--lumo-primary-text-color);
        margin: 0;
      }

      .traits {
        padding-top: var(--lumo-space-xs);
        padding-bottom: var(--lumo-space-xs);
        display: flex;
      }

      .trait-container {
        padding: var(--lumo-space-xs);
      }

      unit-info-panel-view {
        margin-top: var(--lumo-space-s);
        flex: 1 1 0;
      }
    `;
  }

  @property()
  unit?: Unit;

  @property({type: Boolean})
  expert = false;

  changeMode() {
    this.expert = !this.expert;
  }

  render(): TemplateResult {
    console.log(this.unit?.unitType);
    const traits = this.unit?.specialities.slice(1) || [];
    return html` <div class="unit-card">
      <div class="top-bar"><country-flag .country=${this.unit?.unitType.motherCountry}></country-flag><vaadin-button @click=${this.changeMode}>${this.expert ? "Simple" : "Expert"}</vaadin-button></div>
      <div class="unit-title">
        <p class="unit-name">${this.unit?.name}</p>
        <p class="unit-command-points">${this.unit?.commandPoints}</p>
      </div>
      <div class="traits">
        ${traits.map(
          (speciality) => html`<div class="trait-container">
            <vaadin-icon
              icon="waryes-svg:${getIconForSpecialty(speciality)}"
            ></vaadin-icon>
          </div>`
        )}
      </div>
      <unit-armor-view .unit=${this.unit}></unit-armor-view>
      <unit-weapon-view
        style="max-width: 100%"
        .unit=${this.unit}
        ?expert=${this.expert}
      ></unit-weapon-view>
      <unit-info-panel-view .unit=${this.unit}></unit-info-panel-view>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'unit-card': UnitCard;
  }
}
