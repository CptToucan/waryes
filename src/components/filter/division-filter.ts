import {css, html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {Division} from '../../types/deck-builder';
import '@vaadin/combo-box';
import {ComboBoxLitRenderer, comboBoxRenderer} from '@vaadin/combo-box/lit';
import {MultiSelectComboBoxSelectedItemsChangedEvent} from '@vaadin/multi-select-combo-box';

@customElement('division-filter')
export class DivisionFilter extends LitElement {
  static get styles() {
    return css`
      vaadin-multi-select-combo-box {
        width: 100%;
      }
      h3 {
        margin: 0;
      }
    `;
  }

  divisionSelected(
    e: MultiSelectComboBoxSelectedItemsChangedEvent<Division>
  ) {

    this.selectedDivisions = [...e.detail.value];

    this.dispatchEvent(
      new CustomEvent('division-filter-changed', {
        detail: {
          divisions: this.selectedDivisions,
        },
      })
    );
    
  }

  @property()
  public divisions: Division[] = [];



  @state()
  private selectedDivisions?: Division[] = [];

  /**
   *
   * @param division
   * @returns
   */
  private divisionRenderer: ComboBoxLitRenderer<Division> = (division) => html`
    <div
      style="display: flex; align-items: center; gap: var(--lumo-space-s); overflow: hidden;"
    >
      <division-flag .division=${division}></division-flag>
      <span
        style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1 1 100%;"
      >
        ${division.name}
      </span>
    </div>
  `;

  render() {
    const selectedDivisions = this.selectedDivisions;


    if(!selectedDivisions) return html`<div>Loading...</div>`;

    return html`
      <vaadin-multi-select-combo-box
        colspan="2"
        label="Divisions"
        .items=${this.divisions}
        .itemLabelPath=${'name'}
        .itemValuePath=${'id'}
        .clearButtonVisible=${true}
        ${comboBoxRenderer(this.divisionRenderer, [])}
        @selected-items-changed=${this.divisionSelected}
      ></vaadin-multi-select-combo-box>
    `;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    'division-filter': DivisionFilter;
  }
}
