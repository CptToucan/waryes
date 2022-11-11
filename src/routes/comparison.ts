import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, query, state} from 'lit/decorators.js';
import '@vaadin/details';
import '@vaadin/split-layout';
import '../components/unit-search';
import '@vaadin/radio-group';
import '@vaadin/scroller';
import '../components/e-chart';
import {EChart} from '../components/e-chart';
import {Unit, Weapon, FieldMetadata, UnitFieldType} from '../types/unit';
import {NumberFieldMetadata} from '../types/NumberFieldMetadata';
import {MultiSelectComboBoxSelectedItemsChangedEvent} from '@vaadin/multi-select-combo-box';
import {RadioGroupValueChangedEvent} from '@vaadin/radio-group';

type MasterState = {
  units: Unit[];
  unitWeapons: UnitWeaponMap;
  fields: NumberFieldMetadata[];
};

/**
 * Type keeping selected weapon for a particular unit
 */
type UnitWeapon = {
  unit: Unit;
  weapon: Weapon;
};

type UnitWeaponMap = {
  [key: string]: UnitWeapon;
};

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

      .chart-panel {
        background-color: var(--lumo-contrast-5pct);
        margin-top: var(--lumo-space-s);
        margin-left: var(--lumo-space-s);
        margin-right: var(--lumo-space-s);
        border-radius: var(--lumo-border-radius-m);
        height: 400px;
      }

      .weapon-selection {
        display: flex;
        flex-direction: column;
      }

      .weapon-selection > vaadin-radio-group {
        width: 100%;
      }

      .detail-panel {
        padding-left: var(--lumo-space-m);
        padding-right: var(--lumo-space-m);
      }

      .button-bar {
        display: flex;
        justify-content: flex-end;
      }

      .button-bar > vaadin-button {
        margin-left: var(--lumo-space-s);
      }

      .units-grid {
        display: grid;
        grid-template-columns: auto auto;
        padding: var(--lumo-space-s);
        grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));

        gap: var(--lumo-space-s);
      }

      .units-grid > unit-card {
      }
    `;
  }

  @query('e-chart')
  echartComponent?: EChart;

  /**
   * Units selected in sidebar
   */
  @state()
  selectedUnits: Unit[] = [];

  /**
   * Weapons selected in sidebar
   */
  @state()
  selectedUnitWeapons: UnitWeaponMap = {};

  /**
   * Fields selected in sidebar
   */
  @state()
  selectedFields: NumberFieldMetadata[] = [];

  /**
   * State of master area
   */
  @state()
  masterState?: MasterState;

  /**
   * Fields that are available to compare
   */
  comparableFields: NumberFieldMetadata[] = [];

  /**
   * Is the sidebar collapsed
   */
  @state()
  private sidebarCollapsed = false;

  /**
   * Applies the settings from the detail panel to the master state
   */
  applySettingsToMaster(): void {
    const newState: MasterState = {
      units: [...this.selectedUnits],
      unitWeapons: {...this.selectedUnitWeapons},
      fields: [...this.selectedFields],
    };

    this.masterState = newState;
  }

  generateChartOptions() {
    // Add a marker for each field that was selected
    const indicators = this.masterState?.fields?.map((field) => {
      return {name: field.label};
    });

    const seriesData = [];

    const legend: string[] = [];
    for (const unit of this.masterState?.units || []) {
      // Add unit to legend
      legend.push(unit.name);

 
      const unitWeapon = this.masterState?.unitWeapons[unit.descriptorName];

      const fieldValuesForUnit = [];

      // Extract each field from the unit weapon
      for (const field of this.masterState?.fields || []) {
        let fieldValue;
        if (field.fieldType === UnitFieldType.UNIT) {
          console.log(field.id, unitWeapon?.unit);
          fieldValue = unitWeapon?.unit[field.id as keyof Unit];
        } else if (field.fieldType === UnitFieldType.WEAPON) {
          console.log(field.id, unitWeapon?.unit);
          fieldValue = unitWeapon?.weapon[field.id as keyof Weapon];
        }
        fieldValuesForUnit.push(fieldValue);
      }


      seriesData.push({
        name: unit.name,
        value: fieldValuesForUnit,
        emphasis: {
          lineStyle: {
            width: 4,
          },
        },
        label: {
          show: false,
          formatter: function (params: any) {
            return params.value;
          },
        },
      });
    }


    
    const chartOption = {
      legend: {
        data: legend,
      },
      textStyle: {
        fontFamily: 'Orbitron',
      },
      tooltip: {
        trigger: 'item',
        confine: true,
      },
      radar: {
        indicator: indicators,
        radius: '60%',
        shape: 'circle',
        axisName: {
          show: true,
        },

        splitLine: {
          lineStyle: {
            color: [
              'rgba(255, 31, 236, 0.1)',
              'rgba(255, 31, 236, 0.2)',
              'rgba(255, 31, 236, 0.4)',
              'rgba(255, 31, 236, 0.6)',
              'rgba(255, 31, 236, 0.8)',
              'rgba(255, 31, 236, 1)',
            ].reverse(),
          },
        },
        splitArea: {
          show: false,
        },
      },
      series: [
        {
          type: 'radar',
          data: seriesData,
          symbolSize: 16,
        },
      ],
    };
    
    return chartOption;
  }

  /**
   * Clears the master area of units
   */
  clearSettingsOnMaster(): void {
    this.masterState = {
      units: [],
      unitWeapons: {},
      fields: [],
    };
  }

  unitsSelected(event: MultiSelectComboBoxSelectedItemsChangedEvent<Unit>) {
    this.selectedUnits = event.detail.value;
    this.requestUpdate();
  }

  weaponsSelected(weapon: Weapon, unit: Unit) {
    this.selectedUnitWeapons[unit.descriptorName] = {weapon, unit};
    this.requestUpdate();
  }

  fieldsSelected(
    event: MultiSelectComboBoxSelectedItemsChangedEvent<NumberFieldMetadata>
  ) {
    this.selectedFields = event.detail.value;
    this.requestUpdate();
  }

  splitterDragged() {
    this.echartComponent?.resize();
  }

  /**
   * Adds all number fields to be selectable
   */
  firstUpdated() {
    const fields: NumberFieldMetadata[] = [];
    for (const fieldName in FieldMetadata.fields) {
      const field = FieldMetadata.fields[fieldName];

      if (field instanceof NumberFieldMetadata) {
        fields.push(field);
      }
    }
    this.comparableFields = fields;
  }

  renderWeaponsForSelectedUnits(): TemplateResult[] {
    const weaponSelectionTemplates: TemplateResult[] = [];

    for (const unit of this.selectedUnits) {
      weaponSelectionTemplates.push(html`<vaadin-radio-group
        label=${unit.name}
        theme="vertical"
        @value-changed=${(event: RadioGroupValueChangedEvent) => {
          const foundWeapon = unit.weapons.find(
            (weapon: Weapon) => weapon.ammoDescriptorName === event.detail.value
          );

          if (foundWeapon) {
            this.weaponsSelected(foundWeapon, unit);
          }
        }}
      >
        ${unit.weapons.map(
          (weapon: Weapon) =>
            html`<vaadin-radio-button
              value=${weapon.ammoDescriptorName}
              label=${weapon.weaponName}
            ></vaadin-radio-button>`
        )}
      </vaadin-radio-group>`);
    }

    return weaponSelectionTemplates;
  }

  renderMasterContent(): TemplateResult {
    let showChart = false;

    if(this.masterState) {
      showChart = this.masterState?.units.length > 0 && this.masterState?.fields.length > 0;
    } 

    return html` <vaadin-scroller
      style="height: 100%;"
      scroll-direction="vertical"
    >
      ${showChart
        ? html` <div class="chart-panel">
            <e-chart .options=${this.generateChartOptions()}></e-chart>
          </div>`
        : html``}

      <div class="units-grid">
        ${this.masterState?.units.map(
          (unit) => html`<unit-card .unit=${unit}></unit-card>`
        )}
      </div>
    </vaadin-scroller>`;
  }

  renderDetailContent(): TemplateResult {
    return html`<vaadin-details opened>
        <div slot="summary">Units</div>
        <unit-search
          @units-selected=${this.unitsSelected}
          .multi=${true}
        ></unit-search>
      </vaadin-details>

      <vaadin-details class="weapon-selection">
        <div slot="summary">Weapons</div>

        ${this.renderWeaponsForSelectedUnits()}
      </vaadin-details>

      <vaadin-details opened>
        <div slot="summary">Fields</div>

        <vaadin-multi-select-combo-box
          placeholder="Select fields"
          .items=${this.comparableFields}
          item-label-path="label"
          @selected-items-changed=${this.fieldsSelected}
        >
        </vaadin-multi-select-combo-box>
      </vaadin-details>
      <div class="button-bar">
        <vaadin-button @click=${this.clearSettingsOnMaster}>
          Clear
        </vaadin-button>
        <vaadin-button @click=${this.applySettingsToMaster}>
          Apply
        </vaadin-button>
      </div>`;
  }

  render(): TemplateResult {
    const sidebarWidthPercentage = this.sidebarCollapsed ? 40 : 100 - 40;

    return html`
      <vaadin-split-layout @splitter-dragend=${this.splitterDragged}>
        <div style="overflow: hidden; width: ${sidebarWidthPercentage}%">
          <vaadin-button
            theme="icon tertiary"
            aria-label="Expand/collapse sidebar"
            @click="${this.toggleSidebar}"
            style="position: absolute;"
          >
            <vaadin-icon
              icon="${this.sidebarCollapsed
                ? 'vaadin:arrow-right'
                : 'vaadin:arrow-left'}"
            ></vaadin-icon>
          </vaadin-button>
          ${this.renderMasterContent()}
        </div>
        <div
          class="detail-panel"
          style="width: ${100 - sidebarWidthPercentage}%"
        >
          ${this.renderDetailContent()}
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
