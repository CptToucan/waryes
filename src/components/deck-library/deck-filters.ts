import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import '@vaadin/multi-select-combo-box';
import {Tag, tags} from '../../types/tags';
import {DivisionsDatabaseService} from '../../services/divisions-db';
import {Country, Division} from '../../types/deck-builder';
import type {ComboBoxLitRenderer} from '@vaadin/combo-box/lit.js';
import {comboBoxRenderer} from '@vaadin/combo-box/lit.js';
import '../country-flag';
import '../division-flag';
import type {FormLayoutResponsiveStep} from '@vaadin/form-layout';
import '@vaadin/form-layout';
import { MultiSelectComboBoxSelectedItemsChangedEvent } from '@vaadin/multi-select-combo-box';
import { ComboBoxSelectedItemChangedEvent } from '@vaadin/combo-box';
import { CheckboxCheckedChangedEvent } from '@vaadin/checkbox';

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

  @state()
  private selectedTags: Tag[] = [];

  @state()
  private selectedDivision?: Division | null;

  @state()
  private selectedCountry?: Country | null;

  @state()
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
    const divisions = await DivisionsDatabaseService.fetchDivisions();
    return divisions;
  }

  /**
   *
   * @param country
   * @returns
   */
  private countryRenderer: ComboBoxLitRenderer<Country> = (country) => html`
    <div style="display: flex; align-items: center; gap: var(--lumo-space-s);">
      <country-flag .country=${country}></country-flag>
      ${country}
    </div>
  `;

  /**
   *
   * @param country
   * @returns
   */
  private divisionRenderer: ComboBoxLitRenderer<Division> = (division) => html`
    <div style="display: flex; align-items: center; gap: var(--lumo-space-s);">
      <division-flag .division=${division}></division-flag>
      ${division.name}
    </div>
  `;

  filter() {

    this.dispatchEvent(new CustomEvent('filters-changed', {
      detail: {
        tags: this.selectedTags,
        division: this.selectedDivision,
        country: this.selectedCountry,
        pro: this.pro
      }
    }));
  }

  clear() {
    this.selectedTags = [];
    this.selectedDivision = null;
    this.selectedCountry = null;
    this.pro = false;

    this.filter();
  }


  render(): TemplateResult {
    // get all the divisions and sort them alphabetically by alliance
    const divisions = this.divisions
      .map((division) => division)
      .sort((a, b) => a.alliance.localeCompare(b.alliance));

    // get all the unique countries from the divisions
    const countries = this.divisions
      .map((division) => division.country)
      .filter((country, index, self) => self.indexOf(country) === index);

    return html`
      <h3>Filters</h3>
      <vaadin-form-layout .responsiveSteps="${this.responsiveSteps}">
        <vaadin-checkbox @checked-changed=${(event: CheckboxCheckedChangedEvent) => this.pro = event.detail.value} .checked=${this.pro} label="Pro"></vaadin-checkbox>
        <vaadin-multi-select-combo-box
          colspan="2"
          label="Tags"
          .items=${tags}
          .clearButtonVisible=${true}
          .selectedItems=${this.selectedTags}
          @selected-items-changed=${(e: MultiSelectComboBoxSelectedItemsChangedEvent<Tag>) => this.selectedTags = e.detail.value}
        ></vaadin-multi-select-combo-box>
        <vaadin-combo-box
          colspan="2"
          label="Division"
          .items=${divisions}
          .itemLabelPath=${'name'}
          .clearButtonVisible=${true}
          .selectedItem=${this.selectedDivision}
          ${comboBoxRenderer(this.divisionRenderer, [])}
          @selected-item-changed=${(e: ComboBoxSelectedItemChangedEvent<Division>) => this.selectedDivision = e.detail.value}
        ></vaadin-combo-box>
        <vaadin-combo-box
          colspan="2"
          label="Country"
          .items=${countries}
          .clearButtonVisible=${true}
          .selectedItem=${this.selectedCountry}
          ${comboBoxRenderer(this.countryRenderer, [])}
          @selected-item-changed=${(e: ComboBoxSelectedItemChangedEvent<Country>) => this.selectedCountry = e.detail.value}
        ></vaadin-combo-box>
        <vaadin-button
          @click=${() => this.clear()}
        >Clear</vaadin-button>
        <vaadin-button theme="primary"
          @click=${() => this.filter()}
        >Filter</vaadin-button>
      </vaadin-form-layout>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'deck-filters': DeckFilters;
  }
}
