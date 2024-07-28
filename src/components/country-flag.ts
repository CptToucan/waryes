import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import Belgium from '../../images/flags/belgium.svg';
import EastGermany from '../../images/flags/east-germany.svg';
import France from '../../images/flags/france.svg';
import SovietUnion from '../../images/flags/soviet-union.svg';
import UK from '../../images/flags/uk.svg';
import USA from '../../images/flags/usa.svg';
import WestGermany from '../../images/flags/west-germany.svg';
import Poland from '../../images/flags/poland.svg';
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
        max-height: 24px;
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
    }
    return html`<img src=${image} alt=${this.country} title=${this.country} />`;
  }
}


declare global {
  interface HTMLElementTagNameMap {
    'country-flag': CountryFlag;
  }
}