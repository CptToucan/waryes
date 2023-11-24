import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
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
        max-height: 56px;
      }
    `;
  }

  @property()
  get weapon(): Weapon | undefined {
    return this._weapon;
  }

  set weapon(value: Weapon | undefined) {
    if(value?.weaponName !== this._weapon?.weaponName) {
      this.showFallback = false;
    }

    this._weapon = value;
  }

  @state()
  _weapon?: Weapon;

  @state()
  showFallback = false;

  render(): TemplateResult {
    if (this.weapon) {
      return html`
        ${this.showFallback
          ? html`<img
              src=${'/404-32x32.png'}
              alt=${'Image could not be found'}
              title=${this._weapon?.weaponName}
            /> `
          : html`<img
              src=${this.generateSrc()}
              alt=${this._weapon?.weaponName}
              title=${this._weapon?.weaponName}
              loading="eager"
              @error=${() => {
                this.showFallback = true;
              }}
            />`}
      `;
    }
    return html``;
  }

  generateSrc() {
    const imageTexture = this._weapon?.imageTexture;
    return `/images/weapons/${imageTexture}.png`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'weapon-image': WeaponImage;
  }
}
