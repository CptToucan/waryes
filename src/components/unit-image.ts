import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {Unit} from '../types/unit';
import {getIconForUnit, getSubIconForUnit} from '../utils/get-icon-for-unit';

@customElement('unit-image')
export class UnitImage extends LitElement {
  static get styles() {
    return css`
      :host {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 150px;
      }

      img {
        border-radius: var(--lumo-border-radius-m);
        width: 100%;
      }

      .unit-sub-icon {
        font-size: 24px;
        position: absolute;
        left: 60%;
        bottom: 0;
      }

      .unit-sub-icon.smaller {
        font-size: 20px;
      }

      .unit-sub-icon.transport {
        left: 45%;
      }
    `;
  }

  @property()
  unit?: Unit;

  @state()
  showFallback = false;

  render(): TemplateResult {
    let iconHtml: TemplateResult;
    if (this.unit) {
      const unit = this.unit;
      const icon = getIconForUnit(unit);

      let subIcon = null;
      if (
        unit.category === 'air' ||
        unit.category === 'hel' ||
        unit.category === 'rec'
      ) {
        const subIconSvg = getSubIconForUnit(unit);
        subIcon = html`<vaadin-icon
          class="unit-sub-cion"
          icon="${subIconSvg}"
        ></vaadin-icon>`;
      }

      iconHtml = html`<div>
        <vaadin-icon style="font-size: 48px;" icon="${icon}"> </vaadin-icon>
        ${subIcon}
      </div> `;
    } else {
      iconHtml = html`<vaadin-icon
        style="font-size: 48px;"
        icon="$vaadin:question"
      ></vaadin-icon>`;
    }

    return html`
      ${this.showFallback
        ? iconHtml
        : html` <img

            src="/images/units/${this.unit?.descriptorName}.png"
            alt=${this.unit?.name}
            title=${this.unit?.name}
            @error=${() => (this.showFallback = true)}
          />`}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'unit-image': UnitImage;
  }
}
