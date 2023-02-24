import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {AccuracyScaling, Unit, Weapon} from '../types/unit';
import {TabsSelectedChangedEvent} from '@vaadin/tabs';
import '@vaadin/tabs';
import {displayDistance} from '../utils/unit-stats/display-distance';
import {displayTime} from '../utils/unit-stats/display-time';
import {displayPercentage} from '../utils/unit-stats/display-percentage';
import '../components/e-chart';
import './trait-badge';
import {displaySpeed} from '../utils/unit-stats/display-speed';

interface WeaponGroupLayout {
  name: string;
  expert?: boolean;
  stats: WeaponStat[];
}

interface WeaponStat {
  name: string;
  expert?: boolean;
  value?: string | boolean | number | null | TemplateResult;
}

@customElement('unit-weapon-view')
export class UnitWeaponView extends LitElement {
  static get styles() {
    return css`
      .weapons-tab {
        width: 100%;
        border-collapse: collapse;
      }

      .weapons-tab {
        display: flex;
        flex-direction: column;
        min-height: 0px;
      }

      vaadin-tab {
        font-size: var(--lumo-font-size-s);
      }

      .weapons-tab .weapons-tab-row {
        color: var(--lumo-contrast);
        display: flex;
        flex-direction: row;
        justify-content: space-between;
      }

      .weapons-tab .name {
        color: var(--lumo-contrast-70pct);
        font-size: 14px;
      }

      .weapons-tab .value {
        text-align: right;
        text-overflow: ellipsis;
        overflow: hidden;
        max-width: 200px;
        font-size: 14px;
      }

      .weapon-stat-border-bottom {
        border-bottom: 1px dotted var(--lumo-contrast-30pct);
      }

      .accuracy-scaling {
        display: flex;
      }

      .accuracy-scaling > div {
        height: 100px;
        flex: 1 1 100%;
      }

      .weapon-traits {
        display: flex;
        flex-direction: row;
        padding: var(--lumo-space-xs);
      }

      .weapon-traits > .trait-container {
        flex: 1 1 100%;
        display: flex;
        justify-content: center;
      }

      .trait {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        padding: 0.4em calc(0.5em + var(--lumo-border-radius-s) / 4);
        color: var(--lumo-primary-text-color);
        background-color: var(--lumo-primary-color-10pct);
        border-radius: var(--lumo-border-radius-s);
        font-family: var(--lumo-font-family);
        font-size: var(--lumo-font-size-s);
        line-height: 1;
        font-weight: 500;
        text-transform: initial;
        letter-spacing: initial;
        min-width: calc(var(--lumo-line-height-xs) * 1em + 0.45em);
      }

      h5 {
        margin: 0;
        margin-top: var(--lumo-space-xs);
        text-decoration: underline;
      }
    `;
  }

  @property()
  unit?: Unit;

  @property({type: Boolean})
  expert = false;

  @state()
  private selectedWeapon = 0;

  private selectedWeaponTabChanged(event: TabsSelectedChangedEvent) {
    this.selectedWeapon = event.detail.value;
  }

  shouldRenderField(expertStat?: boolean) {
    return this.expert || (!this.expert && !expertStat);
  }

  renderStaticAccuracyScaling(weapon: Weapon, expert?: boolean) {
    if (weapon.staticAccuracyScaling) {
      return this.renderAccuracyScaling(
        weapon.staticAccuracyScaling,
        expert ?? false
      );
    }
    return html``;
  }

  renderMotionAccuracyScaling(weapon: Weapon, expert?: boolean) {
    if (weapon.movingAccuracyScaling) {
      return this.renderAccuracyScaling(
        weapon.movingAccuracyScaling,
        expert ?? false
      );
    }
    return html``;
  }

  renderAccuracyScaling(
    accuracyScaling: AccuracyScaling[],
    expertStat: boolean
  ) {
    if (this.shouldRenderField(expertStat)) {
      const seriesData = accuracyScaling.map((scale) => [
        scale.distance,
        scale.accuracy,
      ]);

      const option = {
        xAxis: {
          type: 'value',
          axisLine: {
            show: false,
            onZero: true,
          },
          axisLabel: {
            formatter: '{value}m',
            fontSize: 10,
          },
        },
        yAxis: {
          type: 'value',
          axisLine: {
            show: false,
            onZero: true,
          },
          axisLabel: {
            formatter: '{value}%',
          },
          min: 0,
        },
        grid: {
          left: '5%',
          right: '10%',
          top: '5%',
          bottom: '5%',
          containLabel: true,
        },
        series: [
          {
            type: 'line',
            data: seriesData,
          },
        ],
      };
      return html`<div class="accuracy-scaling">
        <div>
          <e-chart .options=${option}></e-chart>
        </div>
      </div>`;
    }

    return html``;
  }

  renderWeaponTraits(traits: string[]) {
    return html`<div class="weapon-traits">
      ${traits.map(
        (trait) =>
          html`<div class="trait-container">
            <trait-badge>${trait}</trait-badge>
          </div>`
      )}
    </div>`;
  }

  renderStat(
    name: string,
    value: unknown,
    expertStat?: boolean
  ): TemplateResult {
    if (this.shouldRenderField(expertStat)) {
      return html`
        <div class="weapons-tab-row ${expertStat && 'expert'}">
          <div class="name">${name}</div>
          <div class="value">${value}</div>
        </div>
      `;
    } else {
      return html``;
    }
  }

  renderWeaponGroupTitle(name: string, expert?: boolean) {
    if (this.shouldRenderField(expert)) {
      return html`<div class="weapons-tab-row">
        <h5>${name}</h5>
      </div>`;
    }
    return html``;
  }

  renderWeaponSeparator() {
    return html` <div class="weapons-tab-row weapon-stat-border-bottom"></div>`;
  }

  renderWeaponTabs(): TemplateResult[] {
    const tabs = (this.unit?.weapons ?? [])
      .filter((w) => Object.keys(w).length > 0)
      .map((weapon) => {
        return html`<vaadin-tab>${weapon.weaponName}</vaadin-tab>`;
      });

    return tabs;
  }

  renderWeaponStats(weapon: Weapon): TemplateResult {
    const layout: (WeaponGroupLayout | WeaponStat)[] = [];

    layout.push({
      name: 'Name',
      value: weapon.weaponName,
    });

    layout.push({
      name: 'Turret',
      expert: true,
      stats: [
        {name: 'Is Weapon On Turret', value: weapon.hasTurret},
        {
          name: 'Rotation Speed',
          value: `${(weapon.turretRotationSpeed / Math.PI) * 90} deg/s`,
        },
      ],
    });

    if (weapon.missileProperties) {
      const missileProperties = weapon.missileProperties;
      layout.push({
        name: 'Missile',
        expert: true,
        stats: [
          {
            name: 'Speed',
            value: displaySpeed(missileProperties.maxMissileSpeed),
          },
          {
            name: 'Acceleration',
            value: displaySpeed(missileProperties.maxMissileAcceleration),
          },
        ],
      });
    }

    if (weapon.smokeProperties) {
      const smokeProperties = weapon.smokeProperties;
      layout.push({
        name: 'Smoke',
        expert: true,
        stats: [
          {name: 'Height', value: displayDistance(smokeProperties.altitude)},
          {name: 'Radius', value: displayDistance(smokeProperties.radius)},
          {name: 'Life Span', value: displayTime(smokeProperties.lifeSpan)},
        ],
      });
    }

    layout.push({
      name: 'Damage',
      stats: [
        {
          name: 'Penetration',
          value: weapon.penetration,
        },
        {
          name: 'HE',
          value: weapon.he,
        },
        {
          name: 'Total HE',
          value: weapon.totalHeDamage.toFixed(2),
          expert: true,
        },
        {
          name: 'HE Radius',
          value: displayDistance(weapon.heDamageRadius),
          expert: true,
        },
        {
          name: 'Suppress',
          value: weapon.suppress,
        },
        {
          name: 'Suppress Radius',
          value: displayDistance(weapon.suppressDamagesRadius),
          expert: true,
        },
      ],
    });

    layout.push({
      name: 'Range',
      stats: [
        {
          name: 'Ground',
          value: displayDistance(weapon.groundRange),
        },
        {
          name: 'Helicopter',
          value: displayDistance(weapon.helicopterRange),
        },
        {
          name: 'Aircraft',
          value: displayDistance(weapon.planeRange),
        },
      ],
    });

    layout.push({
      name: 'Accuracy',
      stats: [
        {
          name: 'Static',
          value: displayPercentage(weapon.staticAccuracy),
        },
        {
          name: 'Static Over Range',
          value: this.renderStaticAccuracyScaling(weapon, true),
        },
        {
          name: 'Motion',
          value: displayPercentage(weapon.movingAccuracy),
        },
        {
          name: 'Motion Over Range',
          value: this.renderMotionAccuracyScaling(weapon, true),
        },
      ],
    });

    layout.push({
      name: 'Ammo',
      stats: [
        {
          name: 'Rate Of Fire',
          value: weapon.rateOfFire,
        },
        {
          name: 'True Rate of Fire',
          value: Math.round(weapon.trueRateOfFire),
          expert: true,
        },
        {
          name: 'Aiming Time',
          value: displayTime(weapon.aimingTime),
        },
        {
          name: 'Reload Time',
          value: displayTime(weapon.reloadTime),
        },
        {
          name: 'Salvo Length',
          value: weapon.salvoLength,
        },
        {
          name: 'Time Between Shots',
          value: displayTime(weapon.timeBetweenSalvos),
          expert: true,
        },
      ],
    });

    layout.push({
      name: 'Supply Cost',
      value: weapon.supplyCost,
    });

    return html`
      <div class="weapons-tab">${this.renderWeaponTraits(weapon.traits)} ${this.renderWeaponLayout(layout)}</div>
    `;
  }

  renderWeaponLayout(layout: (WeaponGroupLayout | WeaponStat)[]) {
    const output: TemplateResult[] = [];
    for (const layoutItem of layout) {
      if (isWeaponGroupLayout(layoutItem)) {
        output.push(this.renderWeaponGroupLayout(layoutItem));
      } else {
        output.push(this.renderWeaponStat(layoutItem));
      }
    }
    return html`${output}`;
  }

  renderWeaponGroupLayout(weaponGroupLayout: WeaponGroupLayout) {
    return html`${this.renderWeaponGroupTitle(
      weaponGroupLayout.name
    )}${weaponGroupLayout.stats.map((stat) => this.renderWeaponStat(stat))}
    ${this.renderWeaponSeparator()} `;
  }

  renderWeaponStat(stat: WeaponStat) {
    if (isTemplateResult(stat.value)) {
      return stat.value;
    }

    return this.renderStat(stat.name, stat.value, stat.expert);
  }

  render(): TemplateResult {
    let weaponMetadata: Weapon | null = null;

    if (
      this.unit?.weapons &&
      this.unit?.weapons.length > 0 &&
      this.unit?.weapons[this.selectedWeapon]
    ) {
      weaponMetadata = this.unit.weapons[this.selectedWeapon];
      return html`
        <vaadin-tabs
          theme="equal-width-tabs center"
          style="max-width: 100%; "
          @selected-changed="${this.selectedWeaponTabChanged}"
        >
          ${this.renderWeaponTabs()}
        </vaadin-tabs>

        ${weaponMetadata && this.renderWeaponStats(weaponMetadata)}
      `;
    }

    return html``;
  }
}

function isWeaponGroupLayout(
  layout: WeaponGroupLayout | WeaponStat
): layout is WeaponGroupLayout {
  return (layout as WeaponGroupLayout).stats !== undefined;
}

function isTemplateResult(input: unknown): input is TemplateResult {
  return (input as TemplateResult)._$litType$ !== undefined;
}

declare global {
  interface HTMLElementTagNameMap {
    'unit-weapon-view': UnitWeaponView;
  }
}
