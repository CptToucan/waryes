import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {BucketFolder} from '../services/bundle-manager';
// @ts-ignore
import WarnoImage from '../../images/warno.png';
// @ts-ignore
import FragoImage from '../../images/frago-transparent.png';
// @ts-ignore
import WarnoLetLooseImage from '../../images/warno-let-loose-transparent.png';

@customElement('mod-image')
export class ModImage extends LitElement {
  static get styles() {
    return css`
      :host {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
      }

      img {
        // width: 100%;
        height: 100%;
      }
    `;
  }

  @property()
  mod?: BucketFolder;

  render(): TemplateResult {
    const srcFor = (mod?: BucketFolder) => {
      switch (mod) {
        case BucketFolder.WARNO:
          return WarnoImage;
        default:
          return '';
      }
    };

    return html`<img
            src=${srcFor(this.mod)}
            alt=${this.mod || 'Mod logo'}>
            </img>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mod-image': ModImage;
  }
}
