import {html} from 'lit';
import {customElement} from 'lit/decorators.js';
import {AbstractFilterValue} from './abstract-filter-value';
import '@vaadin/number-field';
import { NumberFieldValueChangedEvent } from '@vaadin/number-field';

@customElement('filter-number-value')
export class FilterNumberValue extends AbstractFilterValue {
  valueChanged(event: NumberFieldValueChangedEvent) {
    const value = event.detail.value;
    if(this.filter) {
      this.filter.value = value; 
      this.dispatchEvent(
        new CustomEvent('value-changed', {detail: this.filter})
      )
    }
    
  }

  render() {
    return html`
      <vaadin-number-field label="Value" @value-changed=${this.valueChanged} ?autofocus=${true}></vaadin-number-field>
    `;
  }
}