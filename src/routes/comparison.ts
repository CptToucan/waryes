import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, query, state} from 'lit/decorators.js';
import '@vaadin/details';
import '../components/unit-search';
import '@vaadin/radio-group';
import '@vaadin/scroller';
import '../components/e-chart';
import {EChart} from '../components/e-chart';
import {Unit, Weapon, FieldMetadata, UnitFieldType} from '../types/unit';
import {NumberFieldMetadata} from '../types/NumberFieldMetadata';
import {MultiSelectComboBoxSelectedItemsChangedEvent} from '@vaadin/multi-select-combo-box';
import {RadioGroupValueChangedEvent} from '@vaadin/radio-group';
import {notificationService} from '../services/notification';
import {ifDefined} from 'lit/directives/if-defined.js';

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

      h3 {
        margin: 0;
      }

      .master-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin: var(--lumo-space-xs);
        padding-left: var(--lumo-space-s);
        padding-right: var(--lumo-space-s);
        border-bottom: 1px solid var(--lumo-contrast-10pct);
      }

      .master-panel {
        width: 100%;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }

      .empty-state {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        color: var(--lumo-contrast-70pct);
        padding: var(--lumo-space-m);
        text-align: center;
      }

      .empty-state > div {
        display: flex;
        margin-top: var(--lumo-space-s);
      }

      vaadin-scroller {
        flex: 1 1 100%;
      }

      .detail-panel {
        padding-left: var(--lumo-space-m);
        padding-right: var(--lumo-space-m);
        border-left: 1px solid var(--lumo-contrast-10pct);
        width: 30%;
      }

      .detail-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      @media only screen and (max-width: 700px) {
        .detail-panel {
          width: 100%;
        }

        .master-panel.master-sidebar-expanded {
          display: none;
        }

        .show-on-large-screens {
          display: none;
        }
      }

      @media only screen and (min-width: 701px) {
        .show-on-small-screens {
          display: none;
        }
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
        padding: var(--lumo-space-s);
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));

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
  selectedUnits: Unit[] = [];

  /**
   * Weapons selected in sidebar
   */
  selectedUnitWeapons: UnitWeaponMap = {};

  /**
   * Fields selected in sidebar
   */
  selectedFields: NumberFieldMetadata[] = [];

  /**
   * State of master area
   */
  @state()
  masterState?: MasterState;

  /**
   * Fields that are available to compare
   */
  @state()
  comparableFields: NumberFieldMetadata[] = [];

  /**
   * Is the sidebar collapsed
   */
  @state()
  private sidebarCollapsed = false;

  /**
   * Applies the settings from the detail panel to the master state
   */
  applySettingsToMaster(closeDetail?: boolean): void {
    // set new state in timeout to avoid flickering
    setTimeout(() => {
      const newState: MasterState = {
        units: [...this.selectedUnits],
        unitWeapons: {...this.selectedUnitWeapons},
        fields: [...this.selectedFields],
      };
  
      this.masterState = newState;
    }, 1000);


    if (closeDetail) {
      this.toggleSidebar();
    }

    notificationService.instance?.addNotification({
      content: 'Settings applied',
      duration: 3000,
      theme: '',
    });
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
          fieldValue = unit[field.id as keyof Unit];
        } else if (field.fieldType === UnitFieldType.WEAPON) {
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
        fontFamily: 'RobotoMono',
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
  }

  fieldsSelected(
    event: MultiSelectComboBoxSelectedItemsChangedEvent<NumberFieldMetadata>
  ) {
    this.selectedFields = event.detail.value;
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
        ${unit.weapons.map((weapon: Weapon) => {
          const masterActiveWeapon =
            this?.selectedUnitWeapons[unit.descriptorName]?.weapon
              ?.ammoDescriptorName;
          const shouldBeActive =
            (masterActiveWeapon !== undefined &&
              masterActiveWeapon === weapon.ammoDescriptorName) ||
            undefined;

          return html`<vaadin-radio-button
            value=${weapon.ammoDescriptorName}
            label=${weapon.weaponName}
            checked=${ifDefined(shouldBeActive)}
          ></vaadin-radio-button>`;
        })}
      </vaadin-radio-group>`);
    }

    return weaponSelectionTemplates;
  }

  renderSelectedFields(): TemplateResult {
    if ((this.selectedFields?.length || []) > 0) {
      return html`<vaadin-multi-select-combo-box
        placeholder="Select fields"
        .items=${this.comparableFields}
        .selectedItems=${this.masterState?.fields}
        item-label-path="label"
        @selected-items-changed=${this.fieldsSelected}
      >
      </vaadin-multi-select-combo-box>`;
    }

    return html`<vaadin-multi-select-combo-box
    placeholder="Select fields"
    .items=${this.comparableFields}
    item-label-path="label"
    @selected-items-changed=${this.fieldsSelected}
  >
  </vaadin-multi-select-combo-box>`; 
  }

  renderMasterContent(): TemplateResult {
    if (this.masterState == undefined || this.masterState?.units.length === 0) {
      return html`<div class="empty-state">
        No units selected. Configure selected units to compare them.
        <div>
          <vaadin-button @click=${this.toggleSidebar} theme="primary large">
            <vaadin-icon icon="vaadin:cog" slot="prefix"></vaadin-icon>
            Configure
          </vaadin-button>
        </div>
      </div>`;
    }

    let showChart = false;

    if (this.masterState) {
      showChart =
        this.masterState?.units.length > 0 &&
        this.masterState?.fields.length > 0;
    }

    return html` <vaadin-scroller scroll-direction="vertical">
      ${showChart
        ? html` <div class="chart-panel">
            <e-chart .options=${this.generateChartOptions()}></e-chart>
          </div>`
        : html``}

      <div class="units-grid">
        ${this.masterState?.units.map(
          (unit) => html`<unit-card .unit=${unit} .showImage=${true}></unit-card>`
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
          .selectedUnits=${this.selectedUnits}
        ></unit-search>
      </vaadin-details>

      <vaadin-details class="weapon-selection">
        <div slot="summary">Weapons</div>

        ${this.renderWeaponsForSelectedUnits()}
      </vaadin-details>

      <vaadin-details opened>
        <div slot="summary">Fields</div>
        ${this.renderSelectedFields()}
      </vaadin-details>
      <div class="button-bar">
        <vaadin-button @click=${this.clearSettingsOnMaster}>
          Clear
        </vaadin-button>
        <vaadin-button
          class="show-on-large-screens"
          @click=${() => this.applySettingsToMaster()}
          theme="primary"
        >
          Apply
        </vaadin-button>
        <vaadin-button
          class="show-on-small-screens"
          @click=${() => this.applySettingsToMaster(true)}
          theme="primary"
        >
          Apply and Close
        </vaadin-button>
      </div>`;
  }

  render(): TemplateResult {
    return html`
      <div style="display: flex; height: 100%;">
        <div
          class="master-panel ${this.sidebarCollapsed
            ? 'master-sidebar-collapsed'
            : 'master-sidebar-expanded'}"
        >
          <div class="master-header">
            <h2>Comparison</h2>
            <vaadin-button
              theme="icon secondary"
              aria-label="Expand/collapse sidebar"
              @click="${this.toggleSidebar}"
            >
              <vaadin-icon icon="vaadin:cog"></vaadin-icon>
            </vaadin-button>
          </div>
          ${this.renderMasterContent()}
        </div>
        ${this.sidebarCollapsed
          ? html``
          : html`<div class="detail-panel">
              <div class="detail-header">
                <h2>Settings</h2>
                <vaadin-button
                  theme="icon tertiary"
                  aria-label="Expand/collapse sidebar"
                  @click="${this.toggleSidebar}"
                >
                  <vaadin-icon icon="vaadin:close"></vaadin-icon>
                </vaadin-button>
              </div>

              ${this.renderDetailContent()}
            </div>`}
      </div>
    `;
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }
}
