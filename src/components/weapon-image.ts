import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {Weapon} from '../types/unit';

@customElement('weapon-image')
export class WeaponImage extends LitElement {
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
    `;
  }

  @property()
  weapon?: Weapon;

  render(): TemplateResult {
    if (this.weapon) {
      return html` <img
        src=${this.generateSrc()}
        alt=${this.weapon?.weaponName}
        title=${this.weapon?.weaponName}
      />`;
    }
    return html``;
  }

  generateSrc() {
    const imageTexture = this.weapon?.imageTexture;
    return `/images/weapons/${imageTexture}.png`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'weapon-image': WeaponImage;
  }
}
