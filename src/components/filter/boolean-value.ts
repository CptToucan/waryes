import {css, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import {AbstractFilterValue} from './abstract-filter-value';
import {CheckboxCustomEvent} from '@ionic/core';

@customElement('filter-boolean-value')
export class FilterBooleanValue extends AbstractFilterValue {
  static get styles() {
    return css`
      ion-input {
        --background: var(--ion-panel-background-color) !important;
        --color: white !important;
        --placeholder-color: white !important;
      }
    `;
  }

  didChangeValue(event: CheckboxCustomEvent) {
    const detail = event.detail;
    if (detail && this.filter) {
      this.filter.value = event.detail.checked;
      this.dispatchEvent(
        new CustomEvent('value-changed', {detail: this.filter})
      );
    }
  }

  render() {
    return html`
      <ion-checkbox @ionChange=${this.didChangeValue}></ion-checkbox>
    `;
  }
}
