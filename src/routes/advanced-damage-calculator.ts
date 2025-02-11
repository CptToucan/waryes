import {BeforeEnterObserver, RouterLocation} from '@vaadin/router';
import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import '../components/advanced-damage-calculator';
import {BundleManagerService, DamageTable} from '../services/bundle-manager';
import {Unit} from '../types/unit';
import '@vaadin/checkbox-group';
import {DamageCalculator} from '../classes/damage-calculator/DamageCalculator';
import {CheckboxGroupValueChangedEvent} from '@vaadin/checkbox-group';
import {
  DamageCalculatorDamageCalculated,
  DamageCalculatorDamageCalculatedDetail,
} from '../components/advanced-damage-calculator';

@customElement('advanced-damage-calculator-route')
export class AdvancedDamageCalculatorRoute extends LitElement implements BeforeEnterObserver {
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

      .tables {
        display: flex;
        flex-direction: column;
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
        flex: 1 1 40%;
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

      h5 {
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
        font-size: var(--lumo-font-size-xxs);
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

      .weapon-table-title {
        display: flex;
        flex-direction: row;
        gap: var(--lumo-space-m);
        align-items: center;
      }

      .weapon-table-title h5 {
        margin: 0;
      }

      vaadin-checkbox:not([checked]) weapon-image {
        filter: grayscale(100%) brightness(250%);
      }

      .weapon-table-title weapon-image {
        filter: grayscale(100%) brightness(250%);
        max-width: 100px;
        max-height: 50px;
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
      return (newVal as Unit)?.descriptorName !== (oldVal as Unit)?.descriptorName;
    },
  })
  sourceUnit?: Unit;

  @state({
    hasChanged: (newVal, oldVal) => {
      return (newVal as Unit)?.descriptorName !== (oldVal as Unit)?.descriptorName;
    },
  })
  targetUnit?: Unit;

  @state()
  selectedWeaponIndexes: number[] = [0];

  @state()
  showUnitSelection = true;

  @state()
  get selectedWeapons() {
    const weapons = this.sourceUnit?.weapons || [];
    let selectedWeapons = [];

    for (const index of this.selectedWeaponIndexes) {
      if (weapons[index]) {
        selectedWeapons.push(weapons[index]);
      }
    }
    return selectedWeapons;
  }

  @state({
    hasChanged: (_newVal, _oldVal) => {
      return _newVal !== _oldVal;
    },
  })
  calculatorOutput?: DamageCalculatorDamageCalculatedDetail;

  damageTable?: DamageTable;

  async onBeforeEnter(location: RouterLocation) {
    const unitId = location?.params?.unitId as string;

    if (unitId !== 'NONE' && unitId !== undefined) {
      await this.fetchUnit(unitId);
    }

    this.damageTable = await BundleManagerService.getDamageTable();
  }

  async fetchUnit(unitId: string) {
    const units = await BundleManagerService.getUnits();
    this.sourceUnit = units?.find((u) => u.descriptorName === unitId);
  }

  swapUnits() {
    this.showUnitSelection = false;
    const sourceUnit = this.sourceUnit;
    this.sourceUnit = this.targetUnit;
    this.targetUnit = sourceUnit;

    setTimeout(() => {
      this.showUnitSelection = true;
    }, 0);
  }

  render(): TemplateResult {
    let canTarget = false;

    if (this.selectedWeapons.length > 0 && this.targetUnit) {
      for (const weapon of this.selectedWeapons) {
        canTarget = DamageCalculator.canWeaponTargetUnit(weapon, this.targetUnit);
        if (canTarget) {
          break;
        }
      }
    }

    let calculatorOutput = this.calculatorOutput;

    if (!canTarget) {
      calculatorOutput = undefined;
    }

    let optimalNumberOfShotsToKill = 0;
    let optimalNumberOfShotsToSuppress = 0;
    let optimalTimeToKill = 0;
    // let optimalDPS = 0;
    let optimalTimeToToSuppress = 0;

    let averageNumberOfShotsToKill = 0;
    let averageNumberOfShotsToSuppress = 0;
    let averageTimeToKill = 0;
    // let averageDPS = 0;
    let averageTimeToSuppress = 0;

    const weaponTables = [];

    if (calculatorOutput) {
      optimalNumberOfShotsToKill = calculatorOutput.optimalKillWeaponEvents.filter(
        (e) => e.type === 'shot' || e.type === 'missile-hit'
      ).length;

      optimalNumberOfShotsToSuppress = calculatorOutput.optimalSuppressWeaponEvents.filter(
        (e) => e.type === 'shot' || e.type === 'missile-hit'
      ).length;

      console.log(calculatorOutput.optimalKillWeaponEvents);

      const finalOptimalKillEvent =
        calculatorOutput.optimalKillWeaponEvents[
          calculatorOutput.optimalKillWeaponEvents.length - 1
        ];

      const finalOptimalSuppressEvent =
        calculatorOutput.optimalSuppressWeaponEvents[
          calculatorOutput.optimalSuppressWeaponEvents.length - 1
        ];

      optimalTimeToKill = finalOptimalKillEvent?.time || 0;

      // divide damage by time to get DPS
      // optimalDPS = finalOptimalKillEvent?.damage / optimalTimeToKill;

      optimalTimeToToSuppress = finalOptimalSuppressEvent?.time || 0;

      averageNumberOfShotsToKill = calculatorOutput.killWeaponEvents.filter(
        (e) => e.type === 'shot' || e.type === 'missile-hit'
      ).length;

      averageNumberOfShotsToSuppress = calculatorOutput.suppressWeaponEvents.filter(
        (e) => e.type === 'shot' || e.type === 'missile-hit'
      ).length;

      const finalAverageKillEvent =
        calculatorOutput.killWeaponEvents[calculatorOutput.killWeaponEvents.length - 1];

      const finalAverageSuppressEvent =
        calculatorOutput.suppressWeaponEvents[calculatorOutput.suppressWeaponEvents.length - 1];

      averageTimeToKill = finalAverageKillEvent?.time || 0;
      averageTimeToSuppress = finalAverageSuppressEvent?.time || 0;

      const tableRows: {label: string; values: unknown[]}[] = [
        {label: 'Weapon', values: []},
        {label: 'Damage per shot', values: []},
        {label: 'Suppression per shot', values: []},
        {label: 'Accuracy', values: []},
        {label: 'Optimal DPS', values: []},
        {label: 'Average DPS', values: []},
        {label: 'Optimal Suppress DPS', values: []},
        {label: 'Average Suppress DPS', values: []},
        {label: 'Missile Speed', values: []},
        {label: 'Missile Acceleration', values: []},
        {label: 'Missile Travel Time', values: []},
      ];

      for (const weaponDamageProperties of calculatorOutput?.damageProperties) {
        if (!this.targetUnit) {
          tableRows.forEach((row) => row.values.push('No target selected'));
          continue;
        }

        const canWeaponTarget = DamageCalculator.canWeaponTargetUnit(
          weaponDamageProperties.weapon,
          this.targetUnit
        );
        tableRows[0].values.push(weaponDamageProperties.weapon.weaponName);

        if (!canWeaponTarget) {

            tableRows.forEach((row, index) => {
            if (index > 0) {
              row.values.push('Cannot target unit');
            }
            });
        } else {
            tableRows[1].values.push(
            weaponDamageProperties.damageProperty.physical.damage.toFixed(2)
            );
            tableRows[2].values.push(
            weaponDamageProperties.damageProperty.suppression.damage.toFixed(2)
            );
            tableRows[3].values.push(`${weaponDamageProperties.accuracy.toFixed(1)} %`);
            tableRows[4].values.push(
            calculatorOutput.optimalDps[weaponDamageProperties.weapon.ammoDescriptorName]?.toFixed(
              2
            ) || Number(0).toFixed(2)
            );
            tableRows[5].values.push(
            calculatorOutput.killDps[weaponDamageProperties.weapon.ammoDescriptorName]?.toFixed(
              2
            ) || Number(0).toFixed(2)
            );
            tableRows[6].values.push(
            calculatorOutput.optimalSuppressDps[
              weaponDamageProperties.weapon.ammoDescriptorName
            ]?.toFixed(2) || Number(0).toFixed(2)
            );
            tableRows[7].values.push(
            calculatorOutput.suppressDps[weaponDamageProperties.weapon.ammoDescriptorName]?.toFixed(
              2
            ) || Number(0).toFixed(2)
            );

            if (weaponDamageProperties.weapon.missileProperties) {
            tableRows[8].values.push(
              `${weaponDamageProperties.weapon.missileProperties?.maxMissileSpeed?.toFixed(0)} m/s`
            );
            tableRows[9].values.push(
              `${weaponDamageProperties.weapon.missileProperties?.maxMissileAcceleration.toFixed(
              0
              )} m/s²`
            );
            tableRows[10].values.push(
              `${weaponDamageProperties.missileProperties?.missileTravelTimeToTarget?.toFixed(2)} s`
            );
            } else {
            tableRows[8].values.push('');
            tableRows[9].values.push('');
            tableRows[10].values.push('');
            }
        }
      }

      weaponTables.push({
        title: 'Weapon Comparison',
        rows: tableRows,
      });

      const totalTableRows: {label: string; values: unknown[]}[] = [
        {label: '', values: []},
        {label: 'Number of Shots to Kill', values: []},
        {label: 'Numbers of Shots to Suppress', values: []},
        {label: 'Time To Kill', values: []},
        {label: 'DPS', values: []},
        {label: 'Time To Suppress', values: []},
        {label: 'Suppression DPS', values: []},
      ];
      
      totalTableRows[0].values.push('Optimal', 'Average');
      totalTableRows[1].values.push(calculatorOutput.damageProperties.length === 1 ? optimalNumberOfShotsToKill : "N/A" , calculatorOutput.damageProperties.length === 1 ? averageNumberOfShotsToKill : "N/A");
      totalTableRows[2].values.push(calculatorOutput.damageProperties.length === 1 ? optimalNumberOfShotsToSuppress : "N/A", calculatorOutput.damageProperties.length === 1 ? averageNumberOfShotsToSuppress : "N/A");
      totalTableRows[3].values.push(`${optimalTimeToKill.toFixed(2)} s`, `${averageTimeToKill.toFixed(2)} s`);
      totalTableRows[4].values.push(calculatorOutput.optimalDps.totalDps.toFixed(2), calculatorOutput.killDps.totalDps.toFixed(2));
      totalTableRows[5].values.push(`${optimalTimeToToSuppress.toFixed(2)} s`, `${averageTimeToSuppress.toFixed(2)} s`);
      totalTableRows[6].values.push(calculatorOutput.optimalSuppressDps.totalDps.toFixed(2), calculatorOutput.suppressDps.totalDps.toFixed(2));

      weaponTables.push({
        title: 'Total Comparison',
        rows: totalTableRows,
      });
    }

    return html`
      <div class="container">
        ${this.sourceUnit
          ? html` <unit-card
              class="source-unit show-on-desktop"
              .unit=${this.sourceUnit}
              .showImage=${true}
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
              <h4>Source</h4>
              ${this.showUnitSelection
                ? html`<unit-search
                    theme="small"
                    .selectedUnits=${[this.sourceUnit]}
                    @unit-selected=${(e: CustomEvent) => {
                      this.sourceUnit = e.detail.value;
                      this.selectedWeaponIndexes = [0];
                    }}
                  ></unit-search>`
                : html``}

              <vaadin-checkbox-group
                theme="vertical small"
                @value-changed=${(e: CheckboxGroupValueChangedEvent) => {
                  let indexes = [];
                  for (const index of e.detail.value) {
                    indexes.push(parseInt(index));
                  }

                  this.selectedWeaponIndexes = indexes;
                }}
              >
                ${this.sourceUnit?.weapons.map(
                  (w, i) =>
                    html`<vaadin-checkbox
                      value="${i}"
                      ?checked=${i === this.selectedWeaponIndexes.find((index) => index === i)}
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
                      ></vaadin-checkbox
                    >`
                )}
              </vaadin-checkbox-group>
            </div>
            <div class="target">
              <h4>Target</h4>
              ${this.showUnitSelection
                ? html` <unit-search
                    theme="small"
                    @unit-selected=${(e: CustomEvent) => {
                      this.targetUnit = e.detail.value;
                    }}
                    .selectedUnits=${[this.targetUnit]}
                  ></unit-search>`
                : html``}
            </div>
          </div>

          <advanced-damage-calculator
            .weapons=${this.selectedWeapons}
            .sourceUnit=${this.sourceUnit}
            .targetUnit=${this.targetUnit}
            .damageTable=${this.damageTable}
            @damage-calculated=${(e: DamageCalculatorDamageCalculated) => {
              this.calculatorOutput = e.detail;
            }}
          ></advanced-damage-calculator>

          <h2 class="border-separator">Results</h2>
          <div class="tables">
            ${weaponTables[0] ? this.renderMultipleValueTable(weaponTables[0].rows) : html``}
            ${weaponTables[1] ? this.renderMultipleValueTable(weaponTables[1].rows) : html``}
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
      </div>
    `;
  }

  renderSingleValueTable(tableRows: {label: string; value: unknown}[]) {
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

  renderMultipleValueTable(tableRows: {label: string; values: unknown[]}[]) {
    return html`<table>
      <thead>
        <tr>
          <th></th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        ${tableRows.map(
          (row) => html`<tr>
            <td>${row.label}</td>
            ${row.values.map((value) => html`<td>${value}</td>`)}
          </tr>`
        )}
      </tbody>
    </table>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'advanced-damage-calculator-route': AdvancedDamageCalculatorRoute;
  }
}
