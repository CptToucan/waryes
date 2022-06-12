import {css, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import {operator, quality} from '../../types';
import {AbstractFilterValue} from './abstract-filter-value';
import {SelectCustomEvent} from '@ionic/core';

@customElement('filter-enum-value')
export class FilterEnumValue extends AbstractFilterValue {
  static get styles() {
    return css`
      ion-select {
        --background: var(--ion-panel-background-color) !important;
        --color: white !important;
        --placeholder-color: white !important;
      }

      ion-select {
        background: var(--ion-panel-background-color) !important;
      }
    `;
  }

  didSelectField(event: SelectCustomEvent<operator>) {
    const detail = event.detail;
    if(detail && this.filter) {
      this.filter.value = detail.value;
      this.dispatchEvent(new CustomEvent('value-changed', {detail: this.filter}));
    }
  }

  render() {
    const qualityValues = Object.values(quality);
    return html` <ion-select multiple @ionChange=${this.didSelectField}>
      ${qualityValues.map(
        (qualityValue) =>
          html`<ion-select-option value=${qualityValue}
            >${qualityValue}</ion-select-option
          >`
      )}
    </ion-select>`;
  }
}
