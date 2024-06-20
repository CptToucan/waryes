import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import { getAllianceNameFromDescriptor } from '../utils/get-alliance-name-from-descriptor';

import ICON_NATO from '../../images/flags/nato.png';
import ICON_PACT from '../../images/flags/pact.png';

const ICONS_ALLIANCE_MAP: {[key: string]: any} = {
    "ENationalite/Allied": ICON_NATO,
    "ENationalite/Axis": ICON_PACT
}

@customElement('alliance-flag')
export class AllianceFlag extends LitElement {
  static get styles() {
    return css``;
  }

  @property()
  alliance?: string

  render(): TemplateResult {
    const allianceName = this.alliance ? getAllianceNameFromDescriptor(this.alliance) : 'invalid alliance';
    const icon = this.alliance ? ICONS_ALLIANCE_MAP[this.alliance] : '';
    return html`<img width="40" src=${icon} alt=${ allianceName } title=${ allianceName } />`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'alliance-flag': AllianceFlag;
  }
}
