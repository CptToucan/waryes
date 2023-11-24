import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {AccuracyScaling, Weapon} from '../types/unit';
import {displayDistance} from '../utils/unit-stats/display-distance';
import {displayTime} from '../utils/unit-stats/display-time';
import {displayPercentage} from '../utils/unit-stats/display-percentage';
import {displayProjectileSpeed} from '../utils/unit-stats/display-projectile-speed';
import {displayProjectileAcceleration} from '../utils/unit-stats/display-projectile-acceleration';

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

@customElement('individual-weapon-view')
export class IndividualWeaponView extends LitElement {
  static get styles() {
    return css`
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

      .stat-row {
        color: var(--lumo-contrast);
        background-color: var(--lumo-contrast-5pct);
        margin-bottom: 2px;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        padding: 2px;
      }

      .title-row {
        background-color: var(--lumo-background);
      }

      .name {
        color: var(--lumo-contrast-70pct);
        font-size: var(--lumo-font-size-xs);
      }

      .value {
        text-align: right;
        text-overflow: ellipsis;
        overflow: hidden;
        font-size: var(--lumo-font-size-xs);
      }

      .weapon-stat-border-bottom {
        background-color: var(--lumo-background);
        // border-bottom: 1px dotted var(--lumo-contrast-30pct);
      }

      .accuracy-scaling {
        display: flex;
      }

      .accuracy-scaling > div {
        height: 100px;
        flex: 1 1 100%;
      }

      h5 {
        margin: 0;
        margin-top: var(--lumo-space-xs);
      }

      .weapon-image-container {
        display: flex;
        justify-content: center;
        align-items: center;
      }
    `;
  }

  @property()
  weapon?: Weapon;

  @property()
  expert = false;

  generateLayout(weapon: Weapon) {
    const layout: (WeaponGroupLayout | WeaponStat)[] = [];

    layout.push({
      name: 'Weapon',
      value: `${weapon.weaponName} x ${weapon.numberOfWeapons}`,
    });

    layout.push({
      name: 'Ammunition',
      value: weapon.ammunitionPerSalvo * weapon.numberOfSalvos,
    });

    layout.push({
      name: 'True Ammunition',
      expert: true,
      value: weapon.numberOfSalvos * weapon.salvoLength,
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
            value: displayProjectileSpeed(missileProperties.maxMissileSpeed),
          },
          {
            name: 'Acceleration',
            value: displayProjectileAcceleration(
              missileProperties.maxMissileAcceleration
            ),
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
          value: weapon.totalHeDamage?.toFixed(2),
        },
        {
          name: 'HE per weapon',
          value: weapon.he,
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
        {
          name: 'Armor 1-shot at Max Range',
          value:
            weapon.instaKillAtMaxRangeArmour > 0
              ? weapon.instaKillAtMaxRangeArmour
              : 'N/A',
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
          name: 'Ground Min Range',
          value: displayDistance(weapon.groundMinRange),
          expert: true,
        },
        {
          name: 'Helicopter',
          value: displayDistance(weapon.helicopterRange),
        },
        {
          name: 'Helicopter Min Range',
          value: displayDistance(weapon.helicopterMinRange),
          expert: true,
        },
        {
          name: 'Aircraft',
          value: displayDistance(weapon.planeRange),
        },
        {
          name: 'Aircraft Min Range',
          value: displayDistance(weapon.planeMinRange),
          expert: true,
        },
        {
          name: 'Dispersion at Max Range',
          value: displayDistance(weapon.dispersionAtMaxRange),
          expert: true,
        },
        {
          name: 'Dispersion at Min Range',
          value: displayDistance(weapon.dispersionAtMinRange),
          expert: true,
        },
      ],
    });

    layout.push({
      name: 'Accuracy per Shot',
      stats: [
        {
          name: 'Static',
          value: displayPercentage(weapon.staticAccuracy),
        },
        {
          name: 'Consecutive Shot Bonus',
          value: displayPercentage(weapon.staticPrecisionBonusPerShot),
          expert: true,
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
          name: 'Consecutive Shot Bonus',
          value: displayPercentage(weapon.movingPrecisionBonusPerShot),
          expert: true,
        },
        {
          name: 'Motion Over Range',
          value: this.renderMotionAccuracyScaling(weapon, true),
        },
        {
          name: 'Max Consecutive Bonus Count',
          value: weapon.maxSuccessiveHitCount || 0,
          expert: true,
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
        {
          name: 'Noise Malus',
          value: weapon.noiseMalus,
          expert: true,
        },
        {
          name: 'Shots Before Max Noise',
          value: weapon.shotsBeforeMaxNoise,
          expert: true,
        },
        {
          name: 'Supply Cost',
          value: weapon.supplyCost,
        },
      ],
    });

    return layout;
  }

  render(): TemplateResult {
    const weapon = this.weapon;

    if (weapon) {
      const layout = this.generateLayout(weapon);

      return html`
        ${this.renderWeaponTraits(weapon.traits)}
        ${this.renderWeaponImage(weapon)} ${this.renderWeaponLayout(layout)}
      `;
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

  renderWeaponImage(weapon: Weapon) {
    return html` <a
      class="weapon-image-container"
      href="/weapon/${weapon.ammoDescriptorName}"
    >
      <weapon-image .weapon=${weapon}></weapon-image>
    </a>`;
  }

  renderWeaponStat(stat: WeaponStat) {
    if (isTemplateResult(stat.value)) {
      return stat.value;
    }

    return this.renderStat(stat.name, stat.value, stat.expert);
  }

  renderStat(
    name: string,
    value: unknown,
    expertStat?: boolean
  ): TemplateResult {
    if (this.shouldRenderField(expertStat)) {
      return html`
        <div class="stat-row ${expertStat && 'expert'}">
          <div class="name">${name}</div>
          <div class="value">${value}</div>
        </div>
      `;
    } else {
      return html``;
    }
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
    if (this.shouldRenderField(weaponGroupLayout.expert)) {
      return html`${this.renderWeaponGroupTitle(
        weaponGroupLayout.name
      )}${weaponGroupLayout.stats.map((stat) => this.renderWeaponStat(stat))} `;
    }
    return html``;
  }

  renderWeaponGroupTitle(name: string, expert?: boolean) {
    if (this.shouldRenderField(expert)) {
      return html`<div class="title-row stat-row">
        <h5>${name}</h5>
      </div>`;
    }
    return html``;
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

  renderAccuracyScaling(scaling: AccuracyScaling, expertStat: boolean) {
    if (this.shouldRenderField(expertStat)) {
      const series = [];
      const legend = [];

      if (scaling.ground) {
        series.push({
          name: 'Ground',
          type: 'line',
          data: scaling.ground.map((scale) => [scale.distance, scale.accuracy]),
        });
        legend.push('Ground');
      }
      if (scaling.helicopter) {
        series.push({
          name: 'Heli',
          type: 'line',
          data: scaling.helicopter.map((scale) => [
            scale.distance,
            scale.accuracy,
          ]),
        });
        legend.push('Heli');
      }
      if (scaling.plane) {
        series.push({
          name: 'Plane',
          type: 'line',
          data: scaling.plane.map((scale) => [scale.distance, scale.accuracy]),
        });
        legend.push('Plane');
      }

      const option = {
        legend: {show: true, data: legend, right: 0},
        tooltip: {
          trigger: 'axis',
          formatter: (params: Object | Array<unknown>) => {
            const param = params as Array<{
              value: Array<number>;
              seriesName: string;
            }>;
            const distance = param[0].value[0];
            const accuracy = param[0].value[1];
            return `${param[0].seriesName}: ${accuracy}% at ${distance}m`;
          },
        },
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
          max: 100,
          min: 0,
        },
        grid: {
          bottom: '5%',
          left: '5%',
          right: '10%',
          top: '5%',
          /*
          
          */

          containLabel: true,
        },
        series,
      };
      return html`<div class="accuracy-scaling">
        <div>
          <e-chart .options=${option}></e-chart>
        </div>
      </div>`;
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
  return (input as TemplateResult)?._$litType$ !== undefined;
}

declare global {
  interface HTMLElementTagNameMap {
    'individual-weapon-view': IndividualWeaponView;
  }
}
