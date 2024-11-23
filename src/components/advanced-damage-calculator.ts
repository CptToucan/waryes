import {ComboBoxSelectedItemChangedEvent} from '@vaadin/combo-box';
import {css, html, LitElement, PropertyValues} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {
  Veterancy,
  Cohesion,
} from '../lib/veterancies-and-cohesions';
import {Unit, Weapon} from '../types/unit';
import { DamageCalculator } from '../classes/damage-calculator/DamageCalculator';
import { DamageTable } from '../services/bundle-manager';
import { Motion } from '../lib/motion';
import { Side } from '../lib/side';





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
  private _weapon?: Weapon | undefined;

  @property()
  public get weapon(): Weapon | undefined {
    return this._weapon;
  }
  public set weapon(value: Weapon | undefined) {
    const oldAmmoDescriptor = this._weapon?.ammoDescriptorName;
    const newAmmoDescriptor = value?.ammoDescriptorName;
    this._weapon = value;

    if (oldAmmoDescriptor !== newAmmoDescriptor) {
      this.motion = Motion.STATIC;

      if (this.targetUnit && value) {
        this.maxRange = DamageCalculator.getMaxRangeOfWeaponTargettingUnit(value, this.targetUnit);
        this.minRange = DamageCalculator.getMinRangeOfWeaponTargettingUnit(value, this.targetUnit);
        this.distance = this.maxRange;
      }

      this.calculateDamage();
    }
  }

  private _sourceUnit?: Unit | undefined;

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
      return (
        (newVal as Unit)?.descriptorName !== (oldVal as Unit)?.descriptorName
      );
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
    this.maxRange = this.weapon ? DamageCalculator.getMaxRangeOfWeaponTargettingUnit(this.weapon, value) : 0;
    this.minRange = this.weapon ? DamageCalculator.getMinRangeOfWeaponTargettingUnit(this.weapon, value) : 0;

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


  protected willUpdate(_changedProperties: PropertyValues): void {
    super.willUpdate(_changedProperties);
    this.calculateDamage();

  }

  public async calculateDamage() {
    if (!this.weapon || !this.sourceUnit || !this.targetUnit || !this.damageTable) {
      return;
    }

    const damageCalculator = new DamageCalculator(
      {
        unit: this.sourceUnit,
        weapon: this.weapon,
      },
      this.targetUnit,
      this.damageTable
    );


    const damageProperties = damageCalculator.calculate(
      this.distance,
      this.armourDirection,
      this.selectedTerrain,
      this.sourceVeterancy,
      this.targetVeterancy,
      this.motion,
      this.cohesion
    );

    console.log(damageProperties);

    this.dispatchEvent(
      new CustomEvent('damage-calculated', {
        detail: {
          ...damageProperties,
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
            this.calculateDamage();
          }}
        />
      </div>
      <div class="min-max ${shouldDisableOptions ? 'disabled' : ''}">
        <div class="end-tick">
          <span>${this.minRange}m</span><span>Min</span>
        </div>
        <div class="end-tick">
          <span>${this.maxRange}m</span><span>Max</span>
        </div>
      </div>

      <div class="distance-value"></div>
    `;
  }

  render() {
    let selectedUnitCanBeTargetedByWeapon = false;

    if(this.weapon && this.targetUnit) {
       selectedUnitCanBeTargetedByWeapon = DamageCalculator.canWeaponTargetUnit(this.weapon, this.targetUnit);
    }

    const shouldDisableOptions =
      !this.weapon || !this.targetUnit || !selectedUnitCanBeTargetedByWeapon;

    const motionOptions: Motion[] = [];

    if ((this.weapon?.maxStaticAccuracy || 0) > 0) {
      motionOptions.push(Motion.STATIC);
    }

    if ((this.weapon?.maxMovingAccuracy || 0) > 0) {
      motionOptions.push(Motion.MOVING);
    }

    const veterancyOptionsForSourceUnit = this.sourceUnit ? DamageCalculator.getVeterancyOptions(this.sourceUnit) : [];
    const veterancyOptionsForTargetUnit = this.targetUnit ? DamageCalculator.getVeterancyOptions(this.targetUnit) : [];
    const cohesionOptionForSourceUnit = this.sourceUnit ? DamageCalculator.getCohesionOptions(this.sourceUnit) : [];

    const occupiableTerrainsForUnit = this.targetUnit ? ['None', ...DamageCalculator.getOccupiableTerrainsForUnit(this.targetUnit)] : [];

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
          @selected-item-changed=${(
            e: ComboBoxSelectedItemChangedEvent<Veterancy>
          ) => {
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
          @selected-item-changed=${(
            e: ComboBoxSelectedItemChangedEvent<Cohesion>
          ) => {
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
          @selected-item-changed=${(
            e: ComboBoxSelectedItemChangedEvent<Motion>
          ) => {
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
          @selected-item-changed=${(
            e: ComboBoxSelectedItemChangedEvent<Veterancy>
          ) => {
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
          @selected-item-changed=${(
            e: ComboBoxSelectedItemChangedEvent<Side>
          ) => {
            this.armourDirection = e.detail.value || Side.FRONT;
            this.calculateDamage();
          }}
        ></vaadin-combo-box>

        <vaadin-combo-box
          label="Target Terrain"
          ?disabled=${shouldDisableOptions}
          .selectedItem=${this.selectedTerrain}
          .items=${occupiableTerrainsForUnit}
          @selected-item-changed=${(
            e: ComboBoxSelectedItemChangedEvent<string>
          ) => {
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
