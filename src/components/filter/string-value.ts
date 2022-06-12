import { InputCustomEvent } from '@ionic/core';
import {css, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import { AbstractFilterValue } from "./abstract-filter-value"

@customElement('filter-string-value')
export class FilterStringValue extends AbstractFilterValue {
  static get styles() {
    return css`
      ion-input {
        --background: var(--ion-panel-background-color) !important;
        --color: white !important;
        --placeholder-color: white !important;
      }
    `;
  }


  didEnterValue(event: InputCustomEvent) {
    const value = event.detail.value;
    if(value && this.filter) {
      this.filter.value = value;
      this.dispatchEvent(new CustomEvent('value-changed', {detail: this.filter}));
    }
  }

  render() {
    return html`<ion-input @ionChange=${this.didEnterValue}></ion-input>`
  }
}
