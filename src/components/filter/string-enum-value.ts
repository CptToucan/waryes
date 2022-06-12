import {css, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import { AbstractFilterValue } from "./abstract-filter-value"

@customElement('filter-string-enum-value')
export class FilterStringEnumValue extends AbstractFilterValue {
  static get styles() {
    return css`
      ion-input {
        --background: var(--ion-panel-background-color) !important;
        --color: white !important;
        --placeholder-color: white !important;
      }
    `;
  }

  render() {
    return html`<ion-input></ion-input>`;
  }
}
