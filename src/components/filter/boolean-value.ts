import {html} from 'lit';
import {customElement} from 'lit/decorators.js';
import {AbstractFilterValue} from './abstract-filter-value';
import '@vaadin/checkbox';
import { CheckboxCheckedChangedEvent } from '@vaadin/checkbox';

@customElement('filter-boolean-value')
export class FilterBooleanValue extends AbstractFilterValue {
  checkedChanged(event: CheckboxCheckedChangedEvent) {
    const checked = event.detail.value;
    if(this.filter) {
      this.filter.value = checked; 
      this.dispatchEvent(
        new CustomEvent('value-changed', {detail: this.filter})
      )
    }
    
  }

  render() {
    return html`
      <vaadin-checkbox label="Value" @checked-changed=${this.checkedChanged} ?autofocus=${true}></vaadin-checkbox>
    `;
  }
}