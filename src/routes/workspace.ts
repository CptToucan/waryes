import {css, html, LitElement} from 'lit';
import {customElement,state} from 'lit/decorators.js';
import {UnitService} from '../services/unit';
import { WarnoUnit, WarnoWeapon } from '../types';

function b64_to_utf8( str: string ): string {
  return decodeURIComponent(escape(window.atob( str )));
}

type comparisonSettings = {
  selectedUnitWeapons: {id: string, weapon: string}[]
  unitFields: string[]
  weaponFields: string[]
}

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

  comparisonSettings?: comparisonSettings

  connectedCallback() {
    super.connectedCallback();
    const urlSearchParams = window.location.hash.split('?')[1];
    this.comparisonSettings = JSON.parse(b64_to_utf8(urlSearchParams));
  }

  generateChartOptions() {
    let indicators: {name: string}[] = [];
    const seriesData = [];
    const legend: string[] = [];

    console.log(this.comparisonSettings);

    if(this.comparisonSettings) {
      const units: WarnoUnit[] = UnitService.getUnitsById(this.comparisonSettings?.selectedUnitWeapons.map((unit) => unit.id));
      const selectedUnitFields = this.comparisonSettings.unitFields;
      const selectedWeaponFields = this.comparisonSettings.weaponFields;
      indicators = [...selectedUnitFields, ...selectedWeaponFields].map((field) => {return {name: field}});
      
      for(const unit of units) {
        const valuesForUnit = [];
        const selectedWeapon = this.comparisonSettings.selectedUnitWeapons.find((unitWeapon) => unit.id === unitWeapon.id)?.weapon;

        legend.push(unit.name);
        for(const field of selectedUnitFields) {
          console.log(field);
          valuesForUnit.push(unit[field]);
        }

        for(const field of selectedWeaponFields) {
          if(selectedWeapon) {
            const weaponData: string = (unit[selectedWeapon] as unknown as WarnoWeapon)[field];
            valuesForUnit.push(weaponData);
          }
          else {
            console.error(`Couldn't find weapon on unit, defaulting property ${field} to 0`)
            valuesForUnit.push(0);
          }
        }

        seriesData.push({name: unit.name, value: valuesForUnit});
      }

    }

    


     return {
      legend: {
        data: legend,
      },
      textStyle: {
        fontFamily: 'Orbitron',
      },
      radar: {
        indicator: indicators,
        shape: 'circle',
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
        splitArea: false,
      },
      series: [
        {
          type: 'radar',
          data: seriesData,
          symbolSize: 16,
        },
      ],
    };
  }

  render() {
    return html`<e-chart .options=${this.generateChartOptions()}></e-chart>`
  }
}


