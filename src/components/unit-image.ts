import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {Unit} from '../types/unit';
import { getIconsWithFallback } from '../utils/get-icons-with-fallback';

@customElement('unit-image')
export class UnitImage extends LitElement {
  static get styles() {
    return css`
      :host {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        width: 150px;
      }

      img {
        // border-radius: var(--lumo-border-radius-m);
        width: 100%;
      }

      vaadin-icon {
        font-size: 24px;
      }

      .unit-sub-icon.smaller {
        font-size: 20px;
      }

      .unit-sub-icon.transport {
        left: 45%;
      }

      .icon-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        width: 100%;
        flex: 1 1 0;
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

      const icons = getIconsWithFallback(unit);
      let subIcon;

      if(icons.subIcon) {
        subIcon = html`<vaadin-icon
        class="unit-sub-cion"
        icon="${icons.subIcon}"
      ></vaadin-icon>`;
      }

      iconHtml = html`<div class="icon-wrapper">
        <vaadin-icon icon="${icons.icon}"> </vaadin-icon>
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
            src=${this.generateSrc()}
            alt=${this.unit?.name}
            title=${this.unit?.name}
            @error=${() => {
              const img = new Image();
              img.onerror = () => {this.showFallback = true}
              img.src = this.generateSrc();
            }}
          />`}
    `;
  }

  generateSrc() {
    let descriptorName = this.unit?.descriptorName;

    if(this.unit?.descriptorName === undefined) return "";

    if(descriptorName?.endsWith("_frago")) {
      descriptorName = descriptorName.replace("_frago", "");
    }

    if(descriptorName?.endsWith("_warno_let_loose")) {
      descriptorName = descriptorName.replace("_warno_let_loose", "");
    }
    

    return `/images/units/${descriptorName}.png`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'unit-image': UnitImage;
  }
}
