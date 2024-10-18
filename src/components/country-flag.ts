import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import Belgium from '../../images/flags/BEL_FLAG.png';
import EastGermany from '../../images/flags/RDA_FLAG.png';
import France from '../../images/flags/FR_FLAG.png';
import SovietUnion from '../../images/flags/SOV_FLAG.png';
import UK from '../../images/flags/UK_FLAG.png';
import USA from '../../images/flags/US_FLAG.png';
import WestGermany from '../../images/flags/RFA_FLAG.png';
import Poland from '../../images/flags/POL_FLAG.png';
import Netherlands from '../../images/flags/NL_FLAG.png';
import Luxembourg from '../../images/flags/LUX_FLAG.png';
import { Country } from '../types/deck-builder';

@customElement('country-flag')
export class CountryFlag extends LitElement {
  static get styles() {
    return css`
      :host {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
      }

      img {
        width: 100%;
      }
    `;
  }

  @property()
  country?: Country;

  render(): TemplateResult {
    let image = '';
    switch (this.country) {
      case Country.BEL:
        image = Belgium;
        break;
      case Country.DDR:
        image = EastGermany;
        break;
      case Country.FR:
        image = France;
        break;
      case Country.SOV:
        image = SovietUnion;
        break;
      case Country.UK:
        image = UK;
        break;
      case Country.US:
        image = USA;
        break;
      case Country.RFA:
        image = WestGermany;
        break;
      case Country.POL:
        image = Poland
        break;
      case Country.NL:
        image = Netherlands;
        break;
      case Country.LUX:
        image = Luxembourg;
        break;
    }
    return html`<img src=${image} alt=${this.country} title=${this.country} />`;
  }
}


declare global {
  interface HTMLElementTagNameMap {
    'country-flag': CountryFlag;
  }
}