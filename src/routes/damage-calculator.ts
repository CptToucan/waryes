import {BeforeEnterObserver, RouterLocation} from '@vaadin/router';
import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import '../components/damage-calculator';
import {BundleManagerService} from '../services/bundle-manager';
import {Unit} from '../types/unit';
import '@vaadin/radio-group';
import {RadioGroupValueChangedEvent} from '@vaadin/radio-group';

@customElement('damage-calculator-route')
export class DamageCalculatorRoute
  extends LitElement
  implements BeforeEnterObserver
{
  static get styles() {
    return css`
      .container {
        display: flex;
        flex-direction: row;
        gap: var(--lumo-space-m);
        padding: var(--lumo-space-s);
        box-sizing: border-box;
      }

      .container > * {
        background-color: var(--lumo-contrast-5pct);
        padding: var(--lumo-space-s);
        border-radius: var(--lumo-border-radius);
      }

      .unit-info {
        display: flex;
        flex-direction: column;
        width: 100%;
      }

      .source-unit {
        flex: 1 1 20%;
        display: flex;
      }

      .configuration {
        flex: 1 1 20%;
        display: flex;
        flex-direction: column;
      }

      .target-unit {
        flex: 1 1 20%;
      }

      unit-image {
        width: 100%;
      }

      .border-radius {
        border-radius: var(--lumo-border-radius-m);
        overflow: hidden;
      }

      h2,
      h3 {
        margin: 0;
        margin-bottom: var(--lumo-space-xs);
      }

      h4 {
        margin: 0;
        margin-top: var(--lumo-space-xs);
      }

      damage-calculator {
        padding-bottom: var(--lumo-space-m);
        margin-bottom: var(--lumo-space-s);
        border-bottom: 1px solid var(--lumo-contrast-20pct);
      }

      .units {
        display: flex;
        flex-direction: column;
        gap: var(--lumo-space-m);
      }

      .units > * {
        flex: 1 1 50%;
      }

      .results {
        display: flex;
        flex-direction: column;
        font-size: var(--lumo-font-size-s);
      }

      .options {
        display: flex;
        flex-wrap: wrap;
      }

      .show-on-desktop {
        display: none;
      }

      @media (min-width: 800px) {
        .units {
          flex-direction: row;
        }
      }

      table {
        table-layout: fixed;
      }

      th {
        text-align: left;
      }

      td {
        padding: var(--lumo-space-xs);
        font-size: var(--lumo-font-size-xs);
      }

      .note {
        font-size: var(--lumo-font-size-s);
        padding-top: var(--lumo-space-s);
        padding-bottom: var(--lumo-space-s);
        color: var(--lumo-contrast-60pct);
      }

      tbody tr {
        background-color: var(--lumo-contrast-5pct);
        border-radius: var(--lumo-border-radius);
      }

      @media (max-width: 800px) {
        .container {
          padding: 0;
        }

        .configuration {
          padding: var(--lumo-space-s);
        }

        .options {
          display: flex;
          flex-direction: column;
        }
      }

      @media (min-width: 1350px) {
        .show-on-desktop {
          display: block;
        }
      }

      .calculator-title {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
      }
    `;
  }

  @state({
    hasChanged: (newVal, oldVal) => {
      return (
        (newVal as Unit)?.descriptorName !== (oldVal as Unit)?.descriptorName
      );
    },
  })
  sourceUnit?: Unit;

  @state({
    hasChanged: (newVal, oldVal) => {
      return (
        (newVal as Unit)?.descriptorName !== (oldVal as Unit)?.descriptorName
      );
    },
  })
  targetUnit?: Unit;

  @state()
  selectedWeaponIndex = 0;

  @state()
  get selectedWeapon() {
    return this.sourceUnit?.weapons[this.selectedWeaponIndex];
  }

  @state()
  calculatorOutput: any;

  async onBeforeEnter(location: RouterLocation) {
    const unitId = location?.params?.unitId as string;

    if (unitId !== 'NONE' && unitId !== undefined) {
      await this.fetchUnit(unitId);
    }
  }

  async fetchUnit(unitId: string) {
    const units = await BundleManagerService.getUnits();
    this.sourceUnit = units?.find((u) => u.descriptorName === unitId);
  }

  swapUnits() {
    const sourceUnit = this.sourceUnit;
    this.sourceUnit = this.targetUnit;
    this.targetUnit = sourceUnit;
  }

  render(): TemplateResult {
    const weaponStatsTable = [
      {
        label: 'Damage Multiplier',
        value: this.calculatorOutput?.damageMultiplier.toFixed(2),
      },
      {
        label: 'Damage per shot',
        value: this.calculatorOutput?.damage.toFixed(2),
      },
      {
        label: 'Suppression Multiplier',
        value: this.calculatorOutput?.suppressionMultiplier.toFixed(2),
      },
      {
        label: 'Suppression per shot',
        value: this.calculatorOutput?.suppressionDamage.toFixed(2),
      },
      {
        label: 'Accuracy',
        value: `${this.calculatorOutput?.accuracy.toFixed(1)} %`,
      },
    ];

    if (this.selectedWeapon?.missileProperties) {
      weaponStatsTable.push(
        {
          label: 'Missile Speed',
          value: `${this.selectedWeapon?.missileProperties?.maxMissileSpeed?.toFixed(
            0
          )} m/s`,
        },
        {
          label: 'Missile Acceleration',
          value: `${this.selectedWeapon?.missileProperties?.maxMissileAcceleration.toFixed(
            0
          )} m/s²`,
        },
        {
          label: 'Missile Travel Time',
          value: `${this.calculatorOutput?.flightTimeOfOneMissile?.toFixed(
            2
          )} s`,
        }
      );
    }

    const optimalTable = [
      {
        label: 'Shots to Kill',
        value: this.calculatorOutput?.shotsToKill.toFixed(1),
      },

      {
        label: 'Time to Kill',
        value: `${this.calculatorOutput?.timeToKill.toFixed(2)} s`,
      },
      {
        label: 'Damage Per Second',
        value: `${this.calculatorOutput?.damagePerSecond.toFixed(2)}`,
      },
      {
        label: 'Shots to Suppress',
        value: this.calculatorOutput?.shotsToMaxSuppression.toFixed(1),
      },
      {
        label: 'Time to Suppress',
        value: `${Math.max(
          this.calculatorOutput?.suppressionTimeToKill,
          0
        ).toFixed(2)} s`,
      },
    ];

    const averageTable = [
      {
        label: 'Shots to Kill',
        value: this.calculatorOutput?.shotsToKillWithAccuracy.toFixed(1),
      },
      {
        label: 'Time to Kill',
        value: `${this.calculatorOutput?.averageTimeToKill.toFixed(2)} s`,
      },
      {
        label: 'Shots to Suppress',
        value:
          this.calculatorOutput?.shotsToMaxSuppressionWithAccuracy.toFixed(1),
      },

      {
        label: 'Time to Suppress',
        value: `${Math.max(
          this.calculatorOutput?.suppressionTimeToKillWithAccuracy,
          0
        ).toFixed(2)} s`,
      },
    ];

    return html`<div class="container">
      ${this.sourceUnit
        ? html` <unit-card
            class="source-unit show-on-desktop"
            .unit=${this.sourceUnit}
            .showImage=${true}
            .selectedWeapon=${this.selectedWeaponIndex}
            @active-weapon-changed=${(e: CustomEvent) => {
              this.selectedWeaponIndex = e.detail;
            }}
          ></unit-card>`
        : html`<div class="source-unit show-on-desktop">
            <h1>Select a source unit</h1>
          </div>`}

      <div class="configuration">
        <div class="calculator-title">
          <h2>Advanced Damage Calculator</h2>
          <vaadin-button
            theme="icon primary small"
            @click=${() => {
              this.swapUnits();
            }}
            ><vaadin-icon icon="vaadin:exchange"></vaadin-icon
          ></vaadin-button>
        </div>
        <div class="units">
          <div class="source">
            <h3>Source</h3>
            <unit-search
              .selectedUnits=${[this.sourceUnit]}
              @unit-selected=${(e: CustomEvent) => {
                this.sourceUnit = e.detail.value;
                this.selectedWeaponIndex = 0;
              }}
            ></unit-search>

            <vaadin-radio-group
              theme="vertical"
              @value-changed=${(e: RadioGroupValueChangedEvent) => {
                this.selectedWeaponIndex = parseInt(e.detail.value);
              }}
            >
              ${this.sourceUnit?.weapons.map(
                (w, i) =>
                  html`<vaadin-radio-button
                    value="${i}"
                    ?checked=${i === this.selectedWeaponIndex}
                    ><label
                      slot="label"
                      style="display: flex; padding: 0; height: 100%; justify-content: flex-start; align-items: flex-end;"
                      ><weapon-image
                        style="width: 64px; min-height: 32px; max-height: 32px; margin-right: 8px; margin-left: 8px; overflow: hidden;"
                        .weapon=${w}
                      ></weapon-image>
                      <div
                        style="height: 100%; font-size: 12px; display: flex; align-items: center;"
                      >
                        ${w.weaponName}
                      </div></label
                    ></vaadin-radio-button
                  >`
              )}
            </vaadin-radio-group>
          </div>
          <div class="target">
            <h3>Target</h3>
            <unit-search
              @unit-selected=${(e: CustomEvent) => {
                this.targetUnit = e.detail.value;
              }}
              .selectedUnits=${[this.targetUnit]}
            ></unit-search>
          </div>
        </div>

        <damage-calculator
          .weapon=${this.selectedWeapon}
          .sourceUnit=${this.sourceUnit}
          .targetUnit=${this.targetUnit}
          @damage-calculated=${(e: CustomEvent) => {
            this.calculatorOutput = e.detail;
          }}
        ></damage-calculator>

        <h2 class="border-separator">Results</h2>
        <div class="results">
          ${this.calculatorOutput?.canTarget
            ? html`
                <h4>Weapon Stats</h4>
                ${this.renderTable(weaponStatsTable)}
                <h4>Optimal Result</h4>
                ${this.renderTable(optimalTable)}
                <h4>Average Result</h4>
                ${this.renderTable(averageTable)}
              `
            : html` <div>Can't target</div> `}

          <div class="note">
            This damage calculator calculates damage from direct hits. It does
            not take into account splash damage or precision bonus for
            consecutive shots (~3% accuracy). It also does not calculate using
            sorting shots (left to right strafing). The average time to kill is
            likely to be slightly longer than you will find in game.
          </div>

          <div class="note">
            It DOES include:
            <ul>
              <li>+20 suppression damage per HP loss.</li>
              <li>Missile travel time (only for missiles)</li>
            </ul>
          </div>
        </div>
      </div>
      ${this.targetUnit
        ? html` <unit-card
            class="target-unit show-on-desktop"
            .unit=${this.targetUnit}
            .showImage=${true}
          ></unit-card>`
        : html`<div class="target-unit show-on-desktop">
            <h1>Select a target unit</h1>
          </div>`}
    </div> `;
  }

  renderTable(tableRows: {label: string; value: unknown}[]) {
    return html`<table>
      <thead>
        <tr>
          <th style="width: 40%"></th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        ${tableRows.map(
          (row) => html`<tr>
            <td>${row.label}</td>
            <td>${row.value}</td>
          </tr>`
        )}
      </tbody>
    </table>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'damage-calculator-route': DamageCalculatorRoute;
  }
}
