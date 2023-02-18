import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import './unit-armor-view';
import './unit-weapon-view';
import './unit-info-panel-view';
import {Unit} from '../types/unit';

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
      }

      .unit-card {
        width: 100%;
        display: flex;
        flex-direction: column;
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


      unit-info-panel-view {
        margin-top: var(--lumo-space-s);
      }
    `;
  }

  @property()
  unit?: Unit;

  render(): TemplateResult {
    return html` <div class="unit-card">
      <div class="unit-title">
        <p class="unit-name">${this.unit?.name}</p>
        <p class="unit-command-points">${this.unit?.commandPoints}</p>
      </div>
      <div>${this.unit?.specialities.map((speciality) => html`<span>[${speciality}]</span>`)}</div>
      <unit-armor-view .unit=${this.unit}></unit-armor-view>
      <unit-weapon-view .unit=${this.unit}></unit-weapon-view>
      <unit-info-panel-view .unit=${this.unit}></unit-info-panel-view>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'unit-card': UnitCard;
  }
}
