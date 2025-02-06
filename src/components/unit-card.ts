import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import './unit-armor-view';
import './unit-weapon-view';
import './unit-info-panel-view';
import './unit-card-header-view';
import './trait-badge';
import './unit-image';
import '@vaadin/button';
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

      unit-image {
        width: 300px;
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

      unit-info-panel-view {
        margin-top: var(--lumo-space-s);
      }

      .image-container {
        display: flex;
        justify-content: center;
      }

      .border-radius {
        border-radius: var(--lumo-border-radius-m);
        overflow: hidden;
      }
    `;
  }

  @property()
  unit?: Unit;

  @property()
  selectedWeapon = 0;

  @property({type: Boolean})
  expert = false;

  changeMode() {
    this.expert = !this.expert;
  }
  @state()
  showImage = false;

  render(): TemplateResult {
    return html` <div class="unit-card">
      <unit-card-header-view
        .unit=${this.unit}
        .expert=${this.expert}
        @mode-toggled=${this.changeMode}
      ></unit-card-header-view>
      ${this.showImage
        ? html`<div class="image-container">
            <div class="border-radius"><unit-image .unit=${this.unit}></unit-image></div>
          </div>`
        : html``}
      <unit-armor-view .unit=${this.unit}></unit-armor-view>
      <unit-weapon-view
        style="max-width: 100%"
        .unit=${this.unit}
        ?expert=${this.expert}
        .selectedWeapon=${this.selectedWeapon}
        @active-weapon-changed=${(e: CustomEvent) => {
          this.dispatchEvent(new CustomEvent('active-weapon-changed', {detail: e.detail}));
        }}
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
