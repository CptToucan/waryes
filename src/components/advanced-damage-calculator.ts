import {ComboBoxSelectedItemChangedEvent} from '@vaadin/combo-box';
import {css, html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {Veterancy, Cohesion} from '../lib/veterancies-and-cohesions';
import {Unit, Weapon} from '../types/unit';
import {DamageCalculator, EventResultType, WeaponEvent} from '../classes/damage-calculator/DamageCalculator';
import {DamageTable} from '../services/bundle-manager';
import {Motion} from '../lib/motion';
import {Side} from '../lib/side';
import './event-timeline';

export type DamageCalculatorDamageCalculated = CustomEvent<DamageCalculatorDamageCalculatedDetail>;
export type DamageCalculatorDpsMap = {totalDps: number, [key: string]: number};
export type DamageCalculatorDamageCalculatedDetail = {
  optimalKillWeaponEvents: WeaponEvent[];
  optimalDps: DamageCalculatorDpsMap;
  killWeaponEvents: WeaponEvent[];
  killDps: DamageCalculatorDpsMap;
  optimalSuppressWeaponEvents: WeaponEvent[];
  optimalSuppressDps: DamageCalculatorDpsMap;
  suppressWeaponEvents: WeaponEvent[];
  suppressDps: DamageCalculatorDpsMap;
  damageProperties: {
    weapon: Weapon;
    damageProperty: {
      physical: {
        family: string;
        damage: number;
        multiplier: number;
      };
      suppression: {
        damage: number;
        multiplier: number;
      };
      simultaneousProjectiles: number;
    };
    accuracy: number;
    missileProperties?: {
      fireAndForget: boolean,
      missileTravelTimeToTarget: number,
    }
  }[];
};

@customElement('advanced-damage-calculator')
export class AdvancedDamageCalculator extends LitElement {
  static get styles() {
    return css`
      .weapon-and-target {
        display: flex;
        gap: var(--lumo-space-m);
      }

      .card {
        display: flex;
        flex-direction: column;
        background-color: var(--lumo-contrast-5pct);
        border-radius: var(--lumo-border-radius);
        padding: var(--lumo-space-m);
      }

      .label-with-input {
        display: flex;
        flex-direction: column;
        flex: 1 1 0;
        align-items: center;
      }

      vaadin-combo-box {
        width: 100%;
        margin: 0;
        padding: 0;
      }

      vaadin-number-field {
        width: 100%;
        margin: 0;
        padding: 0;
      }

      .options {
        display: flex;
        gap: var(--lumo-space-m);
        padding: var(--lumo-space-m) 0;
        flex-wrap: wrap;
      }

      .options > * {
        flex: 1 1 0;
      }

      .button-bar {
        display: flex;
        justify-content: flex-end;
      }

      .error {
        color: var(--lumo-error-text-color);
        text-align: center;
        font-weight: bold;
      }

      input[type='range'] {
        height: 16px;
        -webkit-appearance: none;
        margin: 14px 0;
        width: 100%;
        background: transparent;
        min-width: 100px;
      }

      input[type='range'][disabled] {
        opacity: 40%;
        pointer-events: none;
        color: var(--lumo-disabled-text-color);
        -webkit-text-fill-color: var(--lumo-disabled-text-color);
      }

      label {
        color: var(--lumo-contrast-70pct);
        display: flex;
      }

      .value {
        color: var(--lumo-body-text-color);
        margin-left: var(--lumo-space-s);
      }

      label.disabled {
        color: var(--lumo-contrast-70pct) !important;
      }

      input[type='range']:focus {
        outline: none;
      }
      input[type='range']::-webkit-slider-runnable-track {
        width: 100%;
        height: 8px;
        cursor: pointer;
        animate: 0.2s;
        background: hsla(214, 60%, 80%, 0.14);
        border-radius: 2px;
      }
      input[type='range']::-webkit-slider-thumb {
        height: 14px;
        width: 14px;
        border-radius: 2px;
        background: #ff1fec;
        cursor: pointer;
        -webkit-appearance: none;
        margin-top: -3px;
        border: 0px;
      }
      input[type='range']:focus::-webkit-slider-runnable-track {
        background: hsla(214, 60%, 80%, 0.14);
      }
      input[type='range']::-moz-range-track {
        width: 100%;
        height: 8px;
        cursor: pointer;
        animate: 0.2s;
        background: hsla(214, 60%, 80%, 0.14);
        border-radius: 2px;
      }
      input[type='range']::-moz-range-thumb {
        height: 14px;
        width: 14px;
        border-radius: 2px;
        background: #ff1fec;
        cursor: pointer;
        border: 0px;
      }
      input[type='range']::-ms-track {
        width: 100%;
        height: 8px;
        cursor: pointer;
        animate: 0.2s;
        background: transparent;
        border-color: transparent;
        color: transparent;
      }
      input[type='range']::-ms-fill-lower {
        background: hsla(214, 60%, 80%, 0.14);
        border-radius: 8px;
      }
      input[type='range']::-ms-fill-upper {
        background: hsla(214, 60%, 80%, 0.14);
        border-radius: 8px;
      }
      input[type='range']::-ms-thumb {
        margin-top: 1px;
        height: 14px;
        width: 14px;
        border-radius: 2px;
        background: #ff1fec;
        cursor: pointer;
      }
      input[type='range']:focus::-ms-fill-lower {
        background: hsla(214, 60%, 80%, 0.14);
      }
      input[type='range']:focus::-ms-fill-upper {
        background: hsla(214, 60%, 80%, 0.14);
      }

      .range-field {
        --lumo-text-field-size: var(--lumo-size-m);
        color: var(--lumo-body-text-color);
        font-size: var(--lumo-font-size-m);
        font-family: var(--lumo-font-family);
        padding-left: var(--lumo-space-m);
        padding-right: var(--lumo-space-m);
      }

      .min-max {
        display: flex;
        justify-content: space-between;
      }

      .disabled {
        opacity: 50%;
      }

      .end-tick {
        display: flex;
        flex-direction: column;
        align-items: center;
        color: var(--lumo-contrast-70pct);
        font-size: var(--lumo-font-size-s);
      }

      .distance-value {
        font-size: var(--lumo-font-size-m);
        display: flex;
        justify-content: center;
      }
    `;
  }

  @property()
  damageTable?: DamageTable;

  @state()
  private _weapons: Weapon[] = [];

  @property()
  public get weapons(): Weapon[] {
    return this._weapons;
  }
  public set weapons(value: Weapon[]) {
    let isDifferent = false;
    if (value) {

      if (this._weapons?.length !== value.length) {
        isDifferent = true;
      }

      for (let i = 0; i < value.length; i++) {
        const oldAmmoDescriptor = this._weapons?.[i]?.ammoDescriptorName;
        const newAmmoDescriptor = value[i]?.ammoDescriptorName;

        if (oldAmmoDescriptor !== newAmmoDescriptor) {
          isDifferent = true;
          break;
        }
      }
    }

    this._weapons = value;

    if (isDifferent && this.targetUnit) {
      this.motion = Motion.STATIC;

      let {lowestMinRange, highestMaxRange} = this.getMinMaxWeaponRanges(value, this.targetUnit);

      this.minRange = lowestMinRange;
      this.maxRange = highestMaxRange;
      this.distance = highestMaxRange;

      console.log('weapons changed');

      this.calculateDamage();
    }
  }

  private _sourceUnit?: Unit | undefined;

  private getMinMaxWeaponRanges(weapons: Weapon[], targetUnit: Unit) {
    let lowestMinRange = 0;
    let highestMaxRange = 0;
    for (const weapon of weapons || []) {
      const minRangeOfWeapon = DamageCalculator.getMinRangeOfWeaponTargettingUnit(
        weapon,
        targetUnit
      );
      const maxRangeOfWeapon = DamageCalculator.getMaxRangeOfWeaponTargettingUnit(
        weapon,
        targetUnit
      );

      if (minRangeOfWeapon < lowestMinRange) {
        lowestMinRange = minRangeOfWeapon;
      }

      if (maxRangeOfWeapon > highestMaxRange) {
        highestMaxRange = maxRangeOfWeapon;
      }
    }
    return {lowestMinRange, highestMaxRange};
  }

  @property()
  public get sourceUnit(): Unit | undefined {
    return this._sourceUnit;
  }
  public set sourceUnit(value: Unit | undefined) {
    if (value?.descriptorName !== this._sourceUnit?.descriptorName) {
      this.cohesion = undefined;
      this.sourceVeterancy = undefined;
    }
    this._sourceUnit = value;
  }

  private _targetUnit?: Unit | undefined;

  @state({
    hasChanged: (newVal, oldVal) => {
      return (newVal as Unit)?.descriptorName !== (oldVal as Unit)?.descriptorName;
    },
  })
  public get targetUnit(): Unit | undefined {
    return this._targetUnit;
  }

  public set targetUnit(value: Unit | undefined) {
    if (!value) {
      this._targetUnit = undefined;
      this.maxRange = 0;
      this.minRange = 0;
      this.distance = 0;
      this.targetVeterancy = undefined;
      return;
    }

    const oldValue = this._targetUnit;
    this._targetUnit = value;

    if (this.weapons) {
      let {lowestMinRange, highestMaxRange} = this.getMinMaxWeaponRanges(this.weapons, value);

      this.minRange = lowestMinRange;
      this.maxRange = highestMaxRange;
    }

    if (oldValue?.descriptorName !== value?.descriptorName) {
      this.selectedTerrain = 'None';
      this.distance = this.maxRange;
      this.calculateDamage();
    }
  }

  @state()
  private maxRange = 0;

  @state()
  private minRange = 0;

  @state()
  armourDirection = Side.FRONT;

  @state()
  distance = 0;

  @state()
  selectedTerrain = 'None';

  @state()
  motion: Motion = Motion.STATIC;

  @state()
  cohesion?: Cohesion;

  @state()
  sourceVeterancy?: Veterancy;

  @state()
  targetVeterancy?: Veterancy;

  /*
  protected willUpdate(_changedProperties: PropertyValues): void {
    super.willUpdate(_changedProperties);
    this.calculateDamage();
  }
    */

  public async calculateDamage() {
    if (!this.weapons || !this.sourceUnit || !this.targetUnit || !this.damageTable) {
      return;
    }

    const allWeaponsDamageCalculator = new DamageCalculator(
      {
        unit: this.sourceUnit,
        weapons: this.weapons,
      },
      this.targetUnit,
      this.damageTable
    );

    const optimalKillSimulation = allWeaponsDamageCalculator.simulateKill(
      this.distance,
      this.armourDirection,
      this.selectedTerrain,
      this.sourceVeterancy,
      this.targetVeterancy,
      this.motion,
      this.cohesion,
      EventResultType.OPTIMAL
    );

    const optimalSuppressionSimulation = allWeaponsDamageCalculator.simulateSuppression(
      this.distance,
      this.armourDirection,
      this.selectedTerrain,
      this.sourceVeterancy,
      this.targetVeterancy,
      this.motion,
      this.cohesion,
      EventResultType.OPTIMAL
    );


    const damageProperties = [];
    for (const weapon of this.weapons) {
      const damageProperty = allWeaponsDamageCalculator.getDamagePropertiesForWeaponAgainstTarget(
        weapon,
        this.distance,
        this.armourDirection,
        this.selectedTerrain,
        this.targetVeterancy
      );



      const accuracy = allWeaponsDamageCalculator.getAccuracyWithModifiers(
        weapon,
        this.distance,
        this.motion,
        damageProperty.physical.family,
        this.sourceVeterancy,
        this.targetVeterancy,
        this.cohesion
      );

      const missileProperties = allWeaponsDamageCalculator.calculateMissileProperties(weapon, this.distance);

      damageProperties.push({
        weapon: weapon,
        damageProperty: damageProperty,
        accuracy: accuracy,
        missileProperties: missileProperties
      });
    }

    const killSimulation = allWeaponsDamageCalculator.simulateKill(
      this.distance,
      this.armourDirection,
      this.selectedTerrain,
      this.sourceVeterancy,
      this.targetVeterancy,
      this.motion,
      this.cohesion,
      EventResultType.AVERAGE
    );

    const suppressSimulation = allWeaponsDamageCalculator.simulateSuppression(
      this.distance,
      this.armourDirection,
      this.selectedTerrain,
      this.sourceVeterancy,
      this.targetVeterancy,
      this.motion,
      this.cohesion,
      EventResultType.AVERAGE
    );


    console.log("damage calculated");
    this.dispatchEvent(
      new CustomEvent('damage-calculated', {
        detail: {

          optimalKillWeaponEvents: optimalKillSimulation.events,
          optimalDps: optimalKillSimulation.dpsMap,
          killWeaponEvents: killSimulation.events,
          killDps: killSimulation.dpsMap,
          optimalSuppressWeaponEvents: optimalSuppressionSimulation.events,
          optimalSuppressDps: optimalSuppressionSimulation.dpsMap,
          suppressWeaponEvents: suppressSimulation.events,
          suppressDps: suppressSimulation.dpsMap,
          damageProperties: damageProperties,
        },
      })
    );
  }

  renderDistanceSelect(shouldDisableOptions: boolean) {
    return html`
      <label for="distance" class=${shouldDisableOptions ? 'disabled' : ''}
        >Distance:
        <div class="value">${this.distance}m</div></label
      >
      <div class="range-field">
        <input
          type="range"
          id="distance"
          name="1"
          min="${this.minRange}"
          max="${this.maxRange}"
          .value="${this.distance}"
          ?disabled=${shouldDisableOptions}
          @input=${(e: InputEvent) => {
            this.distance = Number((e.target as HTMLInputElement).value);
            console.log('distance changed');
            this.calculateDamage();
          }}
        />
      </div>
      <div class="min-max ${shouldDisableOptions ? 'disabled' : ''}">
        <div class="end-tick"><span>${this.minRange}m</span><span>Min</span></div>
        <div class="end-tick"><span>${this.maxRange}m</span><span>Max</span></div>
      </div>

      <div class="distance-value"></div>
    `;
  }

  render() {
    let selectedUnitCanBeTargetedByWeapon = false;

    if (this.weapons && this.targetUnit) {
      for (const weapon of this.weapons) {
        selectedUnitCanBeTargetedByWeapon = DamageCalculator.canWeaponTargetUnit(
          weapon,
          this.targetUnit
        );
        if (selectedUnitCanBeTargetedByWeapon) {
          break;
        }
      }
    }

    const shouldDisableOptions =
      !this.weapons || !this.targetUnit || !selectedUnitCanBeTargetedByWeapon;

    let motionOptions: Motion[] = [];

    for (const weapon of this.weapons) {
      if ((weapon.maxStaticAccuracy || 0) > 0) {
        motionOptions.push(Motion.STATIC);
      }

      if ((weapon.maxMovingAccuracy || 0) > 0) {
        motionOptions.push(Motion.MOVING);
      }
    }

    // make motion options unique
    motionOptions = [...new Set(motionOptions)];

    const veterancyOptionsForSourceUnit = this.sourceUnit
      ? DamageCalculator.getVeterancyOptions(this.sourceUnit)
      : [];
    const veterancyOptionsForTargetUnit = this.targetUnit
      ? DamageCalculator.getVeterancyOptions(this.targetUnit)
      : [];
    const cohesionOptionForSourceUnit = this.sourceUnit
      ? DamageCalculator.getCohesionOptions(this.sourceUnit)
      : [];

    const occupiableTerrainsForUnit = this.targetUnit
      ? ['None', ...DamageCalculator.getOccupiableTerrainsForUnit(this.targetUnit)]
      : [];

    return html`
      ${!selectedUnitCanBeTargetedByWeapon && this.targetUnit
        ? html`<div class="error">Weapon cannot target unit</div>`
        : ''}

      <div class="options">
        <vaadin-combo-box
          label="Source Veterancy"
          ?disabled=${shouldDisableOptions}
          .selectedItem=${this.sourceVeterancy}
          .clearButtonVisible=${true}
          .items=${veterancyOptionsForSourceUnit}
          theme="small"
          @selected-item-changed=${(e: ComboBoxSelectedItemChangedEvent<Veterancy>) => {
            this.sourceVeterancy = e.detail.value || undefined;
            this.calculateDamage();
          }}
        >
        </vaadin-combo-box>
        <vaadin-combo-box
          label="Source Cohesion"
          ?disabled=${shouldDisableOptions}
          .selectedItem=${this.cohesion}
          .clearButtonVisible=${true}
          .items=${cohesionOptionForSourceUnit}
          theme="small"
          @selected-item-changed=${(e: ComboBoxSelectedItemChangedEvent<Cohesion>) => {
            this.cohesion = e.detail.value || undefined;
            this.calculateDamage();
          }}
        >
        </vaadin-combo-box>
        <vaadin-combo-box
          label="Source Motion"
          ?disabled=${shouldDisableOptions}
          .selectedItem=${this.motion}
          .items=${[Motion.STATIC, Motion.MOVING]}
          theme="small"
          @selected-item-changed=${(e: ComboBoxSelectedItemChangedEvent<Motion>) => {
            this.motion = e.detail.value || Motion.STATIC;
            this.calculateDamage();
          }}
        >
        </vaadin-combo-box>

        <vaadin-combo-box
          label="Target Veterancy"
          ?disabled=${shouldDisableOptions}
          .selectedItem=${this.targetVeterancy}
          .clearButtonVisible=${true}
          .items=${veterancyOptionsForTargetUnit}
          theme="small"
          @selected-item-changed=${(e: ComboBoxSelectedItemChangedEvent<Veterancy>) => {
            this.targetVeterancy = e.detail.value || undefined;
            this.calculateDamage();
          }}
        >
        </vaadin-combo-box>

        <vaadin-combo-box
          label="Target Direction"
          .selectedItem=${this.armourDirection}
          ?disabled=${shouldDisableOptions}
          .items=${[Side.FRONT, Side.SIDE, Side.REAR, Side.TOP]}
          theme="small"
          @selected-item-changed=${(e: ComboBoxSelectedItemChangedEvent<Side>) => {
            this.armourDirection = e.detail.value || Side.FRONT;
            this.calculateDamage();
          }}
        ></vaadin-combo-box>

        <vaadin-combo-box
          label="Target Terrain"
          ?disabled=${shouldDisableOptions}
          .selectedItem=${this.selectedTerrain}
          .items=${occupiableTerrainsForUnit}
          theme="small"
          @selected-item-changed=${(e: ComboBoxSelectedItemChangedEvent<string>) => {
            this.selectedTerrain = e.detail.value || 'None';
            this.calculateDamage();
          }}
        ></vaadin-combo-box>
      </div>
      <div>${this.renderDistanceSelect(shouldDisableOptions)}</div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'advanced-damage-calculator': AdvancedDamageCalculator;
  }
}
