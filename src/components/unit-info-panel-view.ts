import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {InfoPanelType, Unit} from '../types/unit';
import {displayAmphibious} from '../utils/unit-stats/display-amphibious';
import '@vaadin/tabs';
import {displaySpeed} from '../utils/unit-stats/display-speed';
import {displayDistance} from '../utils/unit-stats/display-distance';
import {displayFuel} from '../utils/unit-stats/display-fuel';
import {displayTime} from '../utils/unit-stats/display-time';
import { displayEcm } from '../utils/unit-stats/display-ecm';

interface PanelItem {
  display: string;
  value?: string | boolean | number | null | TemplateResult;
}

@customElement('unit-info-panel-view')
export class UnitInfoPanelView extends LitElement {
  static get styles() {
    return css`
      :host {
        color: var(--lumo-contrast-90pct);
        font-size: var(--lumo-font-size-xxs);
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
      }

      .info-row {
        display: flex;
      }

      .info-row:not(:last-child) {
        border-bottom: 1px dotted var(--lumo-contrast-30pct);
      }

      .stat {
        flex: 1 1 0;
        padding: var(--lumo-space-xs);
      }

      .stat-name {
        color: var(--lumo-contrast-60pct);
      }

      .stat:not(:last-child) {
        border-right: 1px dotted var(--lumo-contrast-30pct);
      }
    `;
  }

  @property()
  unit?: Unit;

  getLayoutForPanelType(type: InfoPanelType, unit: Unit): PanelItem[][] {
    let panel: PanelItem[][] = [];
    console.log(unit);
    switch (type) {
      case InfoPanelType.DEFAULT:
        panel = this.defaultPanel(unit);
        break;
      case InfoPanelType.INFANTRY:
        panel = this.infantryPanel(unit);
        break;
      case InfoPanelType.HELICOPTER:
        panel = this.helicopterPanel(unit);
        break;
      case InfoPanelType.TRANSPORT_HELICOPTER:
        panel = this.transportHelicopterPanel(unit);
        break;
      case InfoPanelType.TRANSPORT_VEHICLE:
        panel = this.transportVehiclePanel(unit);
        break;
      case InfoPanelType.SUPPLY_HELICOPTER:
        panel = this.supplyHelicopterPanel(unit);
        break;
      case InfoPanelType.SUPPLY_VEHICLE:
        panel = this.supplyVehiclePanel(unit);
        break;
      case InfoPanelType.PLANE:
        panel = this.planePanel(unit);
        break;
    }

    return panel;
  }

  defaultPanel(unit: Unit): PanelItem[][] {
    return [
      [
        {display: 'Max Damage', value: unit.maxDamage},
        {display: 'Optics', value: unit.optics},
        {display: 'Stealth', value: unit.stealth},
      ],
      [
        {display: 'Speed', value: displaySpeed(unit.speed)},
        {
          display: 'Forest Spd.',
          value: displaySpeed(unit.speedsForTerrains.find((t) => t.name === 'forest')?.speed),
        },
        {display: 'Road Speed', value: displaySpeed(unit.roadSpeed)},
      ],
      [
        {display: 'Amphibious', value: displayAmphibious(unit)},
        {display: 'Move Time', value: displayTime(unit.fuelMove)},
        {display: 'Fuel', value: displayFuel(unit.fuel)},
      ],
      [
        {
          display: 'Adv. Deploy',
          value: displayDistance(unit.advancedDeployment),
        },
        {display: 'Smoke', value: unit.hasDefensiveSmoke},
        {display: 'Turn Time', value: displayTime(unit.rotationTime)},
      ],
    ];
  }

  infantryPanel(unit: Unit): PanelItem[][] {
    return [
      [
        {display: 'Strength', value: unit.maxDamage},
        {display: 'Optics', value: unit.optics},
        {display: 'Stealth', value: unit.stealth},
      ],
      [
        {
          display: 'Adv. Deploy',
          value: displayDistance(unit.advancedDeployment),
        },
        {display: 'Speed', value: displaySpeed(unit.speed)},
        {display: 'Turn Time', value: displayTime(unit.rotationTime)},
      ],
      [
        {
          display: 'Forest Spd.',
          value: displaySpeed(unit.speedsForTerrains.find((t) => t.name === 'forest')?.speed),
        },
        {
          display: 'Building Spd.',
          value: displaySpeed(unit.speedsForTerrains.find((t) => t.name === 'building')?.speed),
        },
        {
          display: 'Ruins Spd.',
          value: displaySpeed(unit.speedsForTerrains.find((t) => t.name === 'ruins')?.speed),
        },
      ]
    ];
  }

  transportHelicopterPanel(unit: Unit): PanelItem[][] {
    return [
      [
        {display: 'Max Dmg', value: unit.maxDamage},
        {display: 'Optics', value: unit.optics},
        {display: 'Stealth', value: unit.stealth},
      ],
      [
        {display: 'ECM', value: displayEcm(unit.ecm)},
        {display: 'Speed', value: displaySpeed(unit.speed)},
        {display: 'Move Time', value: displayTime(unit.fuelMove)},
      ],
      [
        {display: 'Fuel', value: displayFuel(unit.fuel)},
        {
          display: 'Adv. Deploy',
          value: displayDistance(unit.advancedDeployment),
        },
        {display: 'Turn Time', value: displayTime(unit.rotationTime)},
      ],
    ];
  }

  transportVehiclePanel(unit: Unit): PanelItem[][] {
    return this.defaultPanel(unit);
  }

  supplyHelicopterPanel(unit: Unit): PanelItem[][] {
    return [
      [
        {display: 'Max Dmg', value: unit.maxDamage},
        {display: 'Optics', value: unit.optics},
        {display: 'Stealth', value: unit.stealth},
      ],
      [
        {display: 'ECM', value: displayEcm(unit.ecm)},
        {display: 'Speed', value: displaySpeed(unit.speed)},
        {display: 'Move Time', value: displayTime(unit.fuelMove)},
      ],
      [
        {display: 'Fuel', value: displayFuel(unit.fuel)},
        {
          display: 'Adv. Deploy',
          value: displayDistance(unit.advancedDeployment),
        },
        {display: 'Supply', value: unit.supply},
      ],
      [
        {display: 'Turn Time', value: displayTime(unit.rotationTime)},
      ]
    ];
  }

  supplyVehiclePanel(unit: Unit): PanelItem[][] {
    return [
      [
        {display: 'Max Dmg', value: unit.maxDamage},
        {display: 'Optics', value: unit.optics},
        {display: 'Stealth', value: unit.stealth},
      ],
      [
        {display: 'Amphibious', value: displayAmphibious(unit)},
        {display: 'Speed', value: displaySpeed(unit.speed)},
        {display: 'Road Speed', value: displaySpeed(unit.roadSpeed)},
      ],
      [
        {
          display: 'Adv. Deploy',
          value: displayDistance(unit.advancedDeployment),
        },
        {display: 'Supply', value: unit.supply},
        {display: 'Turn Time', value: displayTime(unit.rotationTime)},
      ],
    ];
  }

  planePanel(unit: Unit): PanelItem[][] {
    return [
      [
        {display: 'Max Dmg', value: unit.maxDamage},
        {display: 'Air Optics', value: unit.airOptics},
        {display: 'ECM', value: displayEcm(unit.ecm)},
      ],
      [
        {display: 'Turn Radius', value: displayDistance(unit.agility)},
        {display: 'Travel Time', value: displayTime(unit.travelTime)},
        {display: 'Speed', value: displaySpeed(unit.speed)},
      ],
      [
        {display: 'Move Time', value: displayTime(unit.fuelMove)},
        {display: 'Fuel', value: displayFuel(unit.fuel)},
        {
          display: 'Bomb Strategy',
          value: unit.bombStrategy || 'None',
        }
      ],
    ];
  }

  helicopterPanel(unit: Unit): PanelItem[][] {
    return [
      [
        {display: 'Max Dmg', value: unit.maxDamage},
        {display: 'Optics', value: unit.optics},
        {display: 'Stealth', value: unit.stealth},
      ],
      [
        {display: 'ECM', value: displayEcm(unit.ecm)},
        {display: 'Speed', value: displaySpeed(unit.speed)},
        {display: 'Move Time', value: displayTime(unit.fuelMove)},
      ],
      [
        {display: 'Fuel', value: displayFuel(unit.fuel)},
        {display: 'Adv. Deploy', value: displayDistance(unit.advancedDeployment)},
        {display: 'Turn Time', value: displayTime(unit.rotationTime)},
      ]
    ];
  }

  renderPanelDisplay(panelDisplay: PanelItem[][]) {
    return html`${panelDisplay.map(
      (row) => html`<div class="info-row">
        ${row.map(
          (item) =>
            html`<div class="stat">
              <div class="stat-name">${item.display}</div>
              <div class="stat-value">${item.value}</div>
            </div>`
        )}
      </div>`
    )}`;
  }

  render(): TemplateResult {
    try {
      if (this.unit?.infoPanelType) {
        const panelLayout = this.getLayoutForPanelType(
          this.unit.infoPanelType,
          this.unit
        );
        return this.renderPanelDisplay(panelLayout);
      }

      return html`?`;
    } catch (err) {
      console.error(err);
      return html`ERROR`;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'unit-info-panel-view': UnitInfoPanelView;
  }
}
