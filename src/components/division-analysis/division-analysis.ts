import {
  LitElement,
  html,
  css,
  customElement,
  TemplateResult,
  property,
} from 'lit-element';

import './section-analysis';
import './division-trait';
import '../division-flag';

export interface DivisionAnalysis {
  descriptor: string;
  aa_antiHelicopter: number;
  aa_antiPlane: number;
  aa_spaag: number;
  air_armouredCAS: number;
  air_asf: number;
  air_bomber: number;
  air_rocket: number;
  air_sead: number;
  artillery_heavy: number;
  artillery_mortar: number;
  artillery_rocket: number;
  atgm: number;
  general_field: number;
  general_forest: number;
  general_opener: number;
  general_urban: number;
  helicopter_antiAir: number;
  helicopter_antiPersonnel: number;
  helicopter_antiTank: number;
  infantry_antiPersonnel: number;
  infantry_antiTank: number;
  infantry_cost: number;
  infantry_transport: number;
  logistics_cmd: number;
  logistics_slotAvailability: number;
  logistics_supply: number;
  recon_helicopter: number;
  recon_optics: number;
  recon_stealth: number;
  tank_heavy: number;
  tank_light: number;
  tank_medium: number;
}

export interface DivisionCategoryAnalysis {
  [key: string]: number;
}

@customElement('division-analysis-display')
export class DivisionAnalysisDisplay extends LitElement {
  static get styles() {
    return css`
      .division-analysis {
        display: flex;
        display: flex;
        flex-direction: column;
      }

      .division-traits {
        display: flex;
        flex-direction: column;
      }

      .division-sections {
      }

      .title {
        display: flex;
        flex-direction: row;
        gap: var(--lumo-space-s);
        align-items: center;
      }

      division-flag {
        height: 82px;
        width: 82px;
        min-width: 82px;
        min-height: 82px;
      }

      .title > h3 {
        margin: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: var(--lumo-font-size-l);
      }
    `;
  }

  @property()
  divisionName: string | null = null;

  @property()
  divisionAnalysis: DivisionAnalysis | null = null;

  render(): TemplateResult {
    const divisionAnalysis = this.divisionAnalysis;

    if (!divisionAnalysis) {
      return html``;
    }

    const aaCategoryAnalysis: DivisionCategoryAnalysis = {
      'Anti-Helicopter': divisionAnalysis.aa_antiHelicopter,
      'Anti-Plane': divisionAnalysis.aa_antiPlane,
      SPAAG: divisionAnalysis.aa_spaag,
    };

    const airCategoryAnalysis: DivisionCategoryAnalysis = {
      'Armoured CAS': divisionAnalysis.air_armouredCAS,
      ASF: divisionAnalysis.air_asf,
      Bomber: divisionAnalysis.air_bomber,
      Rocket: divisionAnalysis.air_rocket,
      SEAD: divisionAnalysis.air_sead,
    };

    let airAverage = 0;
    let usedAirCategories = 0;

    for (const key in airCategoryAnalysis) {
      
      if (Number(airCategoryAnalysis[key]) !== 0) {
        airAverage += Number(airCategoryAnalysis[key]);
        usedAirCategories++;
      }
    }

    airAverage /= usedAirCategories;

    const artilleryCategoryAnalysis: DivisionCategoryAnalysis = {
      Heavy: divisionAnalysis.artillery_heavy,
      Mortar: divisionAnalysis.artillery_mortar,
      Rocket: divisionAnalysis.artillery_rocket,
    };

    const atgmCategoryAnalysis: DivisionCategoryAnalysis = {
      ATGM: divisionAnalysis.atgm,
    };

    const helicopterCategoryAnalysis: DivisionCategoryAnalysis = {
      'Anti-Air': divisionAnalysis.helicopter_antiAir,
      'Anti-Personnel': divisionAnalysis.helicopter_antiPersonnel,
      'Anti-Tank': divisionAnalysis.helicopter_antiTank,
    };

    const infantryCategoryAnalysis: DivisionCategoryAnalysis = {
      'Anti-Personnel': divisionAnalysis.infantry_antiPersonnel,
      'Anti-Tank': divisionAnalysis.infantry_antiTank,
      Cost: divisionAnalysis.infantry_cost,
      Transport: divisionAnalysis.infantry_transport,
    };

    const logisticsCategoryAnalysis: DivisionCategoryAnalysis = {
      Command: divisionAnalysis.logistics_cmd,
      'Slot Availability': divisionAnalysis.logistics_slotAvailability,
      Supply: divisionAnalysis.logistics_supply,
    };

    const reconCategoryAnalysis: DivisionCategoryAnalysis = {
      Helicopter: divisionAnalysis.recon_helicopter,
      Optics: divisionAnalysis.recon_optics,
      Stealth: divisionAnalysis.recon_stealth,
    };

    const heavyTankCategoryAnalysis: DivisionCategoryAnalysis = {
      Heavy: divisionAnalysis.tank_heavy,
    };

    const lightTankCategoryAnalysis: DivisionCategoryAnalysis = {
      Light: divisionAnalysis.tank_light,
    };

    const mediumTankCategoryAnalysis: DivisionCategoryAnalysis = {
      Medium: divisionAnalysis.tank_medium,
    };

    return html` <div class="division-analysis">
      <div class="title">
        <division-flag
          .divisionId=${this.divisionAnalysis?.descriptor}
        ></division-flag>
        <h3>
          ${this.divisionName
            ? this.divisionName
            : this.divisionAnalysis?.descriptor}
        </h3>
      </div>
      <div class="division-traits"></div>
      <div class="division-sections">
        <section-analysis
          .icon=${'waryes:supply'}
          .sectionTitle=${'Logistics'}
          .analysis=${logisticsCategoryAnalysis}
        ></section-analysis>
        <section-analysis
          .icon=${'waryes:recon'}
          .sectionTitle=${'Recon'}
          .analysis=${reconCategoryAnalysis}
        ></section-analysis>
        <section-analysis
          .icon=${'waryes:infantry'}
          .sectionTitle=${'Infantry'}
          .analysis=${infantryCategoryAnalysis}
        ></section-analysis>

        <section-analysis
          .icon=${'waryes:at'}
          .sectionTitle=${'ATGM'}
          .analysis=${atgmCategoryAnalysis}
        ></section-analysis>
        <section-analysis
          .icon=${'waryes:tank'}
          .sectionTitle=${'Light Tank'}
          .analysis=${lightTankCategoryAnalysis}
        ></section-analysis>
        <section-analysis
          .icon=${'waryes:tank'}
          .sectionTitle=${'Medium Tank'}
          .analysis=${mediumTankCategoryAnalysis}
        ></section-analysis>
        <section-analysis
          .icon=${'waryes:tank'}
          .sectionTitle=${'Heavy Tank'}
          .analysis=${heavyTankCategoryAnalysis}
        ></section-analysis>
        <section-analysis
          .icon=${'waryes:artillery'}
          .sectionTitle=${'Artillery'}
          .analysis=${artilleryCategoryAnalysis}
        ></section-analysis>
        <section-analysis
          .icon=${'waryes:aa'}
          .sectionTitle=${'Anti-Air'}
          .analysis=${aaCategoryAnalysis}
        ></section-analysis>
        <section-analysis
          .icon=${'waryes:helicopter'}
          .sectionTitle=${'Helicopter'}
          .analysis=${helicopterCategoryAnalysis}
        ></section-analysis>
        <section-analysis
          .icon=${'waryes:jet'}
          .sectionTitle=${'Air'}
          .average=${airAverage}
          .analysis=${airCategoryAnalysis}
        ></section-analysis>
      </div>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'division-analysis-display': DivisionAnalysisDisplay;
  }
}
