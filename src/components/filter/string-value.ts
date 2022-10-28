import {html} from 'lit';
import {customElement} from 'lit/decorators.js';
import {AbstractFilterValue} from './abstract-filter-value';
import '@vaadin/text-field';
import { TextFieldValueChangedEvent } from '@vaadin/text-field';

@customElement('filter-string-value')
export class FilterStringValue extends AbstractFilterValue {

  valueChanged(event: TextFieldValueChangedEvent) {
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
      <vaadin-text-field label="Value" @value-changed=${this.valueChanged} ?autofocus=${true}></vaadin-text-field>
    `;
  }
}