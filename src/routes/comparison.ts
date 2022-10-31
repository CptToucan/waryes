import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import '@vaadin/details';
import '@vaadin/split-layout';
import '../components/unit-search';
import '@vaadin/radio-group';
import {Unit, Weapon, FieldMetadata} from '../types/unit';
import { NumberFieldMetadata } from '../types/NumberFieldMetadata';


@customElement('comparison-route')
export class ComparisonRoute extends LitElement {
  static get styles() {
    return css`
      :host {
        flex: 1 1 0;
        height: 100%;
      }

      vaadin-split-layout {
        height: 100%;
      }

      vaadin-multi-select-combo-box {
        width: 100%;
        font-size: var(--lumo-font-size-l);
        flex: 1 1 0;
      }

      .detail-panel {
        padding-left: var(--lumo-space-m);
        padding-right: var(--lumo-space-m);
      }
    `;
  }

  @state()
  selectedUnits: Unit[] = [];

  comparableFields: NumberFieldMetadata[] = [];

  unitsSelected(event: CustomEvent) {
    this.selectedUnits = event.detail.value;
    this.requestUpdate();
  }

  @state()
  private sidebarCollapsed = false;

  renderWeaponsForSelectedUnits(): TemplateResult[] {
    const weaponSelectionTemplates: TemplateResult[] = [];

    for (const unit of this.selectedUnits) {
      weaponSelectionTemplates.push(html`<vaadin-radio-group
        label=${unit.name}
        theme="vertical"
      >
        ${unit.weapons.map(
          (weapon: Weapon) =>
            html`<vaadin-radio-button
              value=${weapon.ammoDescriptorName}
              label=${weapon.ammoDescriptorName}
            ></vaadin-radio-button>`
        )}
      </vaadin-radio-group>`);
    }

    return weaponSelectionTemplates;
  }

  firstUpdated() {

    const fields: NumberFieldMetadata[] = [];
    for(const fieldName in FieldMetadata.fields) {
      const field = FieldMetadata.fields[fieldName];

      if(field instanceof NumberFieldMetadata) {
        fields.push(field)
      }
    }
    this.comparableFields = fields;
  }

  render(): TemplateResult {
    const sidebarWidthPercentage = this.sidebarCollapsed ? 40 : 100 - 40;

    return html`
      <vaadin-split-layout>
        <div style="overflow: hidden; width: ${sidebarWidthPercentage}%">
          <vaadin-button
            theme="icon tertiary"
            aria-label="Expand/collapse sidebar"
            @click="${this.toggleSidebar}"
            style="float: right;"
          >
            <vaadin-icon
              icon="${this.sidebarCollapsed
                ? 'vaadin:arrow-right'
                : 'vaadin:arrow-left'}"
            ></vaadin-icon>
          </vaadin-button>
          Master
        </div>
        <div
          class="detail-panel"
          style="width: ${100 - sidebarWidthPercentage}%"
        >
          <vaadin-details opened>
            <div slot="summary">Units</div>
            <unit-search
              @units-selected=${this.unitsSelected}
              .multi=${true}
            ></unit-search>
          </vaadin-details>

          <vaadin-details opened>
            <div slot="summary">Weapons</div>

            ${this.renderWeaponsForSelectedUnits()}
          </vaadin-details>

          <vaadin-details opened>
            <div slot="summary">Fields</div>

            <vaadin-multi-select-combo-box
            placeholder="Select fields"
                .items=${this.comparableFields}
                item-label-path="label"
            >

            </vaadin-multi-select-combo-box>
          </vaadin-details>
        </div>
      </vaadin-split-layout>
    `;
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }
}

/*


        <vaadin-details opened>
        <div slot="summary">Units</div>
      </vaadin-details>
      <vaadin-details opened>
        <div slot="summary">Weapons</div>
      </vaadin-details>
      <vaadin-details opened>
        <div slot="summary">Fields</div>
      </vaadin-details>

      */
