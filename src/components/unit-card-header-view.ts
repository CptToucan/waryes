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
@customElement('unit-card-header-view')
export class UnitCardHeaderView extends LitElement {
  static get styles() {
    return css`
      .top-bar {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
      }

      div.unit-title {
        display: flex;
        flex-direction: 'column';
        width: 100%;
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
    `;
  }

  @property()
  unit?: Unit;

  @property()
  expert = false;

  render(): TemplateResult {
    const traits = this.unit?.specialities.slice(1) || [];

    return html`
      <div class="top-bar">
        <country-flag
          .country=${this.unit?.unitType.motherCountry}
        ></country-flag
        ><vaadin-button
          @click=${() =>
            this.dispatchEvent(
              new CustomEvent('mode-toggled', {detail: !this.expert})
            )}
          >${this.expert ? 'Simple' : 'Expert'}</vaadin-button
        >
      </div>
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
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'unit-card-header-view': UnitCardHeaderView;
  }
}
