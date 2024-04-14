import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Division } from '../../types/deck-builder';
import '@vaadin/combo-box';
import "../division-flag";
import { ComboBoxLitRenderer, comboBoxRenderer } from '@vaadin/combo-box/lit';
import { MultiSelectComboBoxSelectedItemsChangedEvent } from '@vaadin/multi-select-combo-box';
import { ComboBoxSelectedItemChangedEvent } from '@vaadin/combo-box';

export enum DivisionFilterMode {
  MULTI = 'multi',
  SINGLE = 'single',
}

@customElement('division-filter')
export class DivisionFilter extends LitElement {
  static get styles() {
    return css`
      vaadin-multi-select-combo-box {
        width: 100%;
      }
      vaadin-combo-box {
        width: 100%;
      }

      vaadin-combo-box::before {
        margin-top: 0em;
      }

      vaadin-multi-select-combo-box::before {
        margin-top: 0em;
      }


      h3 {
        margin: 0;
      }
    `;
  }

  multipleDivisionSelected(
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

  singleDivisionSelected(e: ComboBoxSelectedItemChangedEvent<Division>) {
    this.selectedDivisions = e.detail.value ? [e.detail.value] : [];
    this.dispatchEvent(
      new CustomEvent('division-filter-changed', {
        detail: {
          divisions: this.selectedDivisions,
        },
      })
    );
  }

  @property()
  public mode = DivisionFilterMode.MULTI;

  @property({ type: Array })
  public divisions: Division[] = [];

  @property()
  showLabel = true;



  @property()
  public selectedDivisions?: Division[] = [];

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
      <div
        style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1 1 100%;"
      >
        ${division.name}
      </div>
    </div>
  `;

  render() {
    const selectedDivisions = this.selectedDivisions;


    if (!selectedDivisions) return html`<div>Loading...</div>`;

    if (this.mode === DivisionFilterMode.SINGLE) {
      return html`
       <vaadin-combo-box
        .items=${this.divisions}
        .label=${this.showLabel ? 'Division' : ''}
        .itemLabelPath=${'name'}
        .itemValuePath=${'id'}
        .clearButtonVisible=${true}
        ${comboBoxRenderer(this.divisionRenderer, [])}
        @selected-item-changed=${this.singleDivisionSelected}
        .selectedItem=${selectedDivisions[0]}
      ></vaadin-combo-box>`;
    }
    else {

      return html`
      <vaadin-multi-select-combo-box
        colspan="2"
        .items=${this.divisions}
        .label=${this.showLabel ? 'Division' : ''}
        .itemLabelPath=${'name'}
        .itemValuePath=${'id'}
        .clearButtonVisible=${true}
        ${comboBoxRenderer(this.divisionRenderer, [])}
        @selected-items-changed=${this.multipleDivisionSelected}
      ></vaadin-multi-select-combo-box>
    `;
    }
  }
}
declare global {
  interface HTMLElementTagNameMap {
    'division-filter': DivisionFilter;
  }
}
