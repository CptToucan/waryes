import {
  LitElement,
  html,
  css,
  customElement,
  TemplateResult,
} from 'lit-element';

import './section-analysis';
import './division-trait';
import "../division-flag";

export type UnitAnalysisGroup =
  | LogisticalAnalysis
  | ReconAnalysis
  | InfantryAnalysis
  | ATAnalysis
  | TankAnalysis
  | ArtilleryAnalysis
  | AntiAirAnalysis
  | AirAnalysis
  | HelicopterAnalysis;

interface LogisticalAnalysis {
  slotAvailabilityAndPrice: number;
  CMD: number;
  Supply: number;
}

interface GeneralAnalysis {
  opener: number;
  forest: number;
  urban: number;
  field: number;
}

interface ReconAnalysis {
  optics: number;
  stealth: number;
  helicopter: number;
}

interface InfantryAnalysis {
  antiPersonnel: number;
  antiTank: number;
  transport: number;
  cost: number;
}

interface ATAnalysis {
  AT_Rocket: number;
  range: number;
}

interface TankAnalysis {
  light: number;
  medium: number;
  heavy: number;
}

interface ArtilleryAnalysis {
  mortar: number;
  heavy: number;
  rocket: number;
}

interface AntiAirAnalysis {
  antiHelicopter: number;
  antiPlane: number;
  spaag: number;
}

interface AirAnalysis {
  armoredCAS: number;
  AT: number;
  ASF: number;
  SEAD: number;
  bomber: number;
  rocket: number;
}

interface HelicopterAnalysis {
  antiPersonnel: number;
  antiTank: number;
  antiAir: number;
}

interface AllDivisionAnalysis {
  general: GeneralAnalysis;
  logistical: LogisticalAnalysis;
  recon: ReconAnalysis;
  infantry: InfantryAnalysis;
  at: ATAnalysis;
  tank: TankAnalysis;
  artillery: ArtilleryAnalysis;
  antiAir: AntiAirAnalysis;
  air: AirAnalysis;
  helicopter: HelicopterAnalysis;
}

@customElement('division-analysis')
export class DivisionAnalysis extends LitElement {
  static get styles() {
    return css`
      .division-analysis {
        display: flex;
      }

      .division-traits {
        display: flex;
        flex-direction: column;
      }
    `;
  }

  render(): TemplateResult {
    // using a random number between 0 and 10 in increments of 0.5 to simulate the data

    const divisionAnalysis: AllDivisionAnalysis = {
      general: {
        opener: 6.5,
        forest: 5,
        urban: 4,
        field: 7,
      },
      logistical: {
        slotAvailabilityAndPrice: 6,
        CMD: 5,
        Supply: 4,
      },
      recon: {
        optics: 6,
        stealth: 5,
        helicopter: 4,
      },
      infantry: {
        antiPersonnel: 6,
        antiTank: 5,
        transport: 4,
        cost: 3,
      },
      at: {
        AT_Rocket: 4,
        range: 2,
      },
      tank: {
        light: 5,
        medium: 6,
        heavy: 8,
      },
      artillery: {
        mortar: 6,
        heavy: 7,
        rocket: 8,
      },
      antiAir: {
        antiHelicopter: 6,
        antiPlane: 7,
        spaag: 8,
      },
      air: {
        armoredCAS: 6,
        AT: 2,
        ASF: 5,
        SEAD: 0,
        bomber: 5,
        rocket: 0,
      },
      helicopter: {
        antiPersonnel: 6,
        antiTank: 7,
        antiAir: 8,
      },
    };

    return html`
      <div class="division-analysis">
        <division-flag></division-flag>
        <div class="division-traits">
          <division-trait
            .traitTitle=${'Opener'}
            .analysis=${divisionAnalysis.general.opener}
          ></division-trait>
          <division-trait
            .traitTitle=${'Forest'}
            .analysis=${divisionAnalysis.general.forest}
          ></division-trait>
          <division-trait
            .traitTitle=${'Urban'}
            .analysis=${divisionAnalysis.general.urban}
          ></division-trait>
          <division-trait
            .traitTitle=${'Field'}
            .analysis=${divisionAnalysis.general.field}
          ></division-trait>
        </div>
        <div>
          <section-analysis
            .icon=${'waryes:supply'}
            sectionTitle="Logistics"
            .analysis=${divisionAnalysis.logistical}
          ></section-analysis>
          <section-analysis
            .icon=${'waryes:recon'}
            sectionTitle="Recon"
            .analysis=${divisionAnalysis.recon}
          ></section-analysis>
          <section-analysis
            .icon=${'waryes:infantry'}
            sectionTitle="Infantry"
            .analysis=${divisionAnalysis.infantry}
          ></section-analysis>

          <section-analysis
            .icon=${'waryes:at'}
            sectionTitle="ATGM"
            .analysis=${divisionAnalysis.at}
          ></section-analysis>
          <section-analysis
            .icon=${'waryes:tank'}
            sectionTitle="Tank"
            .analysis=${divisionAnalysis.tank}
          ></section-analysis>
          <section-analysis
            .icon=${'waryes:artillery'}
            sectionTitle="Artillery"
            .analysis=${divisionAnalysis.artillery}
          ></section-analysis>
          <section-analysis
            .icon=${'waryes:aa'}
            sectionTitle="Anti-Air"
            .analysis=${divisionAnalysis.antiAir}
          ></section-analysis>
          <section-analysis
            .icon=${'waryes:jet'}
            sectionTitle="Air"
            .analysis=${divisionAnalysis.air}
          ></section-analysis>
          <section-analysis
            .icon=${'waryes:helicopter'}
            sectionTitle="Helicopter"
            .analysis=${divisionAnalysis.helicopter}
          ></section-analysis>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'division-analysis': AllDivisionAnalysis;
  }
}
