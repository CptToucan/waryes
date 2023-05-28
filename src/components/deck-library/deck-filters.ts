import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import '@vaadin/multi-select-combo-box';
import {Tag, tags} from '../../types/tags';
import {Division} from '../../types/deck-builder';
import type {ComboBoxLitRenderer} from '@vaadin/combo-box/lit.js';
import {comboBoxRenderer} from '@vaadin/combo-box/lit.js';
import '../division-flag';
import type {FormLayoutResponsiveStep} from '@vaadin/form-layout';
import '@vaadin/form-layout';
import {MultiSelectComboBoxSelectedItemsChangedEvent} from '@vaadin/multi-select-combo-box';
import {ComboBoxValueChangedEvent} from '@vaadin/combo-box';
import {CheckboxCheckedChangedEvent} from '@vaadin/checkbox';
import { BucketFolder, BundleManagerService } from '../../services/bundle-manager';

@customElement('deck-filters')
export class DeckFilters extends LitElement {
  static get styles() {
    return css`
      :host {
        background-color: var(--lumo-contrast-10pct);
        border-radius: var(--lumo-border-radius);
        padding: var(--lumo-space-s);
        display: flex;
        flex-direction: column;
        width: 320px;
      }

      h3 {
        margin: 0;
      }
    `;
  }

  private responsiveSteps: FormLayoutResponsiveStep[] = [
    // Use one column by default
    {minWidth: 0, columns: 2},
  ];

  @state()
  private divisions: Division[] = [];

  @property()
  private selectedTags: Tag[] = [];

  @property()
  private selectedDivision?: Division | null;

  @property()
  private pro = false;

  async firstUpdated() {
    // Get all the divisions and countries and set them on the component

    const divisions = await this.getDivisions();
    if (divisions) {
      this.divisions = divisions;
    }

    // const countries = await getCountries();
  }

  async getDivisions() {
    const divisions = await BundleManagerService.getDivisionsForBucket(BucketFolder.WARNO);
    return divisions;
  }

  /**
   *
   * @param division
   * @returns
   */
  private divisionRenderer: ComboBoxLitRenderer<Division> = (division) => html`
    <div style="display: flex; align-items: center; gap: var(--lumo-space-s);">
      <division-flag .division=${division}></division-flag>
      ${division.name}
    </div>
  `;

  divisionSelected(e: ComboBoxValueChangedEvent) {
    const id: string = e.detail.value; 
    const division = this.divisions.find((division) => `${division.id}` === `${id}`);
    this.selectedDivision = division;
  }

  filter() {
    this.dispatchEvent(
      new CustomEvent('filters-changed', {
        detail: {
          tags: this.selectedTags,
          division: this.selectedDivision,
          pro: this.pro,
        },
      })
    );
  }

  clear() {
    this.selectedTags = [];
    this.selectedDivision = null;
    this.pro = false;

    this.filter();
  }

  render(): TemplateResult {
    // get all the divisions and sort them alphabetically by alliance
    const divisions = this.divisions
      .map((division) => division)
      .sort((a, b) => a.alliance.localeCompare(b.alliance));

    return html`
      <h3>Filters</h3>
      <vaadin-form-layout .responsiveSteps="${this.responsiveSteps}">
        <vaadin-checkbox
          @checked-changed=${(event: CheckboxCheckedChangedEvent) =>
            (this.pro = event.detail.value)}
          .checked=${this.pro}
          label="Pro"
        ></vaadin-checkbox>
        <vaadin-multi-select-combo-box
          colspan="2"
          label="Tags"
          .items=${tags}
          .clearButtonVisible=${true}
          .selectedItems=${this.selectedTags}
          @selected-items-changed=${(
            e: MultiSelectComboBoxSelectedItemsChangedEvent<Tag>
          ) => (this.selectedTags = e.detail.value)}
        ></vaadin-multi-select-combo-box>
        <vaadin-combo-box
          colspan="2"
          label="Division"
          .items=${divisions}
          .itemLabelPath=${'name'}
          .itemValuePath=${'id'}
          .clearButtonVisible=${true}
          ${comboBoxRenderer(this.divisionRenderer, [])}
          @value-changed=${this.divisionSelected}
        ></vaadin-combo-box>
        <vaadin-button @click=${() => this.clear()}>Clear</vaadin-button>
        <vaadin-button theme="primary" @click=${() => this.filter()}
          >Filter</vaadin-button
        >
      </vaadin-form-layout>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'deck-filters': DeckFilters;
  }
}
