import {EChartsOption} from 'echarts';
import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {UnitService} from '../services/unit';
import {
  Dashboard,
  DashboardType,
  quality,
  UnitMetadata,
  metadataStore,
  WeaponMetadata,
} from '../types';
import {modalController} from '@ionic/core';
import {UrlWatcher} from '../services/location';

function b64_to_utf8(str: string): string {
  return decodeURIComponent(escape(window.atob(str)));
}

const qualityToIntegerMap: qualityToIntegerInterface = {
  [quality.BAD]: 0,
  [quality.MEDIOCRE]: 1,
  [quality.NORMAL]: 2,
  [quality.GOOD]: 3,
  [quality.VERY_GOOD]: 4,
  [quality.EXCEPTIONAL]: 5,
};

type qualityToIntegerInterface = {
  [key in quality]: number;
};

interface stringToNumberInterface {
  [key: string]: number;
}

const yesNo: stringToNumberInterface = {
  Yes: 1,
  No: 0,
};

type comparisonSettings = {
  selectedUnitWeapons: {id: string; weapon: number}[];
  unitFields: string[];
  weaponFields: string[];
};

@customElement('workspace-route')
export class UnitsListRoute extends LitElement {
  static get styles() {
    return css`
      .empty-state {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      }
    `;
  }

  registeredCallback = false;

  protected createRenderRoot() {
    return this;
  }

  async openModal() {
    const modal = await modalController.create({
      component: 'unit-select-modal',
      componentProps: {},
    });

    modal.componentProps = {
      ...modal.componentProps,
      parentModal: modal,
    };
    modal.present();
  }

  @state()
  _chartOptions?: any;

  @state()
  comparisonSettings?: comparisonSettings;

  connectedCallback() {
    this.updateComparisonSettings();

    if (this.registeredCallback === false) {
      UrlWatcher.registerCallback(this.updateComparisonSettings.bind(this));
      this.registeredCallback = true;
    }

    super.connectedCallback();
  }

  updateComparisonSettings() {
    const urlSearchParams = window.location.hash.split('?')[1];

    if (urlSearchParams?.length > 0) {
      this.comparisonSettings = JSON.parse(b64_to_utf8(urlSearchParams));
    } else {
      this.comparisonSettings = undefined;
    }
    this.requestUpdate();
  }

  transformToChartComparison(fieldName: string, unit: UnitMetadata): unknown {
    const allMetadata = UnitService.metadata;

    const fieldMetadata = allMetadata[fieldName as keyof metadataStore];
    const fieldValue = unit[fieldName as keyof UnitMetadata];

    if (fieldMetadata.type === 'enum') {
      return qualityToIntegerMap[fieldValue as keyof qualityToIntegerInterface];
    } else if (fieldMetadata.type === 'boolean') {
      return yesNo[fieldValue as keyof stringToNumberInterface];
    }

    return fieldValue;
  }

  generateChartOptions() {
    let indicators: {name: string}[] = [];
    const seriesData = [];
    const legend: string[] = [];

    if (this.comparisonSettings) {
      const units: UnitMetadata[] = UnitService.getUnitsById(
        this.comparisonSettings?.selectedUnitWeapons.map((unit) => unit.id)
      );
      const selectedUnitFields = this.comparisonSettings.unitFields;
      const selectedWeaponFields = this.comparisonSettings.weaponFields;
      indicators = [...selectedUnitFields, ...selectedWeaponFields].map(
        (field) => {
          return {name: field};
        }
      );

      for (const unit of units) {
        const valuesForUnit = [];
        const selectedWeapon = this.comparisonSettings.selectedUnitWeapons.find(
          (unitWeapon) => unit.id === unitWeapon.id
        )?.weapon;

        legend.push(unit.name);

        for (const field of selectedUnitFields) {
          valuesForUnit.push(
            <string>this.transformToChartComparison(field, unit)
          );
        }

        for (const field of selectedWeaponFields) {
          if (selectedWeapon !== undefined) {
            const weaponData =
              unit.weaponMetadata[selectedWeapon][
                field as keyof WeaponMetadata
              ];
            valuesForUnit.push(weaponData);
          } else {
            console.error(
              `Couldn't find weapon on unit, defaulting property ${field} to 0`
            );
            valuesForUnit.push(0);
          }
        }

        seriesData.push({
          name: unit.name,
          value: valuesForUnit,
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
    }

    const chartOption: EChartsOption = {
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

  render() {
    const dashboard: Dashboard[] = this.generateDashboard();
    let pageContent: TemplateResult;
    if (dashboard.length > 0) {
      pageContent = html`<gridstack-dashboard
        .dashboard=${dashboard}
      ></gridstack-dashboard>`;
    } else {
      pageContent = html`<div class="empty-state">
        <ion-icon name="document-outline"></ion-icon>
        <h2>No workspace configured</h2>
        <div>
          <ion-button @click=${this.openModal} size="large"
            >Configure</ion-button
          >
        </div>
      </div>`;
    }

    return html`${pageContent}  <ion-fab vertical="bottom" horizontal="end" slot="fixed">
    <ion-fab-button ?disabled=${this.comparisonSettings === undefined} @click=${() => {this.comparisonSettings = undefined; this.requestUpdate()}}>
      <ion-icon name="trash-bin-outline"></ion-icon>
    </ion-fab-button>
  </ion-fab>`;
  }

  generateDashboard(): Dashboard[] {
    const dashboard: Dashboard[] = [];
    if (this.comparisonSettings) {
      dashboard.push({
        id: `chart_1`,
        type: DashboardType.CHART,
        data: this.generateChartOptions(),
      });

      const units = UnitService.getUnitsById(
        this.comparisonSettings.selectedUnitWeapons.map((el) => el.id)
      );

      const dashboardUnits: Dashboard[] = units.map((unit) => {
        return {id: `unit_${unit.id}`, type: DashboardType.UNIT, data: unit};
      });
      dashboard.push(...dashboardUnits);
    }

    return dashboard;
  }
}
