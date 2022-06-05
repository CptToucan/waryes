import {EChartsOption} from 'echarts';
import {css, html, LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {UnitService} from '../services/unit';
import {WarnoUnit, WarnoWeapon, Dashboard, DashboardType} from '../types';

function b64_to_utf8(str: string): string {
  return decodeURIComponent(escape(window.atob(str)));
}

const quality: stringToNumberInterface = {
  "Bad": 0,
  "Mediocre": 1,
  "Normal": 2,
  "Good": 3,
  "Very Good": 4,
  "Exceptional": 5
}

interface stringToNumberInterface {
  [key: string]: number
}

const yesNo: stringToNumberInterface = {
  "Yes": 1,
  "No": 0
}

const qualityFields = ["agility", "stealth", "optics"];
const yesNoFields = ["revealInfluence"];

type comparisonSettings = {
  selectedUnitWeapons: {id: string; weapon: string}[];
  unitFields: string[];
  weaponFields: string[];
};

@customElement('workspace-route')
export class UnitsListRoute extends LitElement {
  static get styles() {
    return css``;
  }

  protected createRenderRoot() {
    return this;
  }

  @state()
  _chartOptions?: any;

  comparisonSettings?: comparisonSettings;

  connectedCallback() {
    super.connectedCallback();
    const urlSearchParams = window.location.hash.split('?')[1];
    this.comparisonSettings = JSON.parse(b64_to_utf8(urlSearchParams));
  }

  transformToNumber(fieldName: string, input: string): string {
    
    if(qualityFields.includes(fieldName)) {
      return `${quality[input as keyof stringToNumberInterface]}`;
    }
    else if(yesNoFields.includes(fieldName)) {
      return `${yesNo[input as keyof stringToNumberInterface]}`;
    }

    return input;
  }

  generateChartOptions() {
    let indicators: {name: string}[] = [];
    const seriesData = [];
    const legend: string[] = [];

    if (this.comparisonSettings) {
      const units: WarnoUnit[] = UnitService.getUnitsById(
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
          valuesForUnit.push(this.transformToNumber(field, unit[field]));
        }

        for (const field of selectedWeaponFields) {
          if (selectedWeapon) {
            const weaponData: string = (
              unit[selectedWeapon] as unknown as WarnoWeapon
            )[field];
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
        confine: true
      },
      radar: {
        indicator: indicators,
        radius: "60%",
        shape: 'circle',
        axisName: {
          show: true
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

    return html`<gridstack-dashboard
      .dashboard=${dashboard}
    ></gridstack-dashboard>`;
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
      console.log(units);
      const dashboardUnits: Dashboard[] = units.map((unit) => {
        return {id: `unit_${unit.id}`, type: DashboardType.UNIT, data: unit};
      });
      dashboard.push(...dashboardUnits);
    }

    return dashboard;
  }
}

/* html`<waryes-card style="width: 100%; height: 512px;"><e-chart .options=${this.generateChartOptions()}></e-chart></waryes-card>` */
/*
${units.map((unit) => {
  return html`<div class="grid-stack-item" gs-w="3" gs-h="auto">
    <div class="grid-stack-content">
      <unit-details-card .unit=${unit}></unit-details-card>
    </div>
  </div>`;
})}
*/
