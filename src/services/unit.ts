import {UnitMetadata, WeaponMetadata, fieldType, metadataStore} from '../types';
import {latinize} from '../utils/latinize';
import {
  EnumFieldMetadata,
  BooleanFieldMetadata,
  StringFieldMetadata,
  NumberFieldMetadata,
} from '../metadata';
import { AbstractFieldMetadata } from '../metadata/AbstractFieldMetadata';
import { IonToast } from '@ionic/core/components/ion-toast';

class UnitServiceClass {
  constructor() {
    const _metadataStore: metadataStore = {
      name: new StringFieldMetadata('name', 'Name', fieldType.STATIC),
      commandPoints: new NumberFieldMetadata(
        'commandPoints',
        'Command Points',
        fieldType.STATIC
      ),
      frontArmor: new NumberFieldMetadata(
        'frontArmor',
        'Front Armour',
        fieldType.STATIC
      ),
      rearArmor: new NumberFieldMetadata('rearArmor', 'Rear Armour', fieldType.STATIC),
      sideArmor: new NumberFieldMetadata('sideArmor', 'Side Armour', fieldType.STATIC),
      topArmor: new NumberFieldMetadata('topArmor', 'Top Armour', fieldType.STATIC),
      aiming: new NumberFieldMetadata('aiming', 'Aiming Time', fieldType.WEAPON),
      aircraft: new NumberFieldMetadata('aircraft', 'Aircraft Range', fieldType.WEAPON),
      ammunition: new StringFieldMetadata('ammunition', 'Ammunition', fieldType.WEAPON),
      ground: new NumberFieldMetadata('ground', 'Ground Range', fieldType.WEAPON),
      he: new NumberFieldMetadata('he', 'HE', fieldType.WEAPON),
      helicopter: new NumberFieldMetadata('helicopter', 'Helicopter Range', fieldType.WEAPON),
      motion: new NumberFieldMetadata('motion', 'Motion Accuracy', fieldType.WEAPON),
      weaponName: new StringFieldMetadata('name', 'Name', fieldType.WEAPON),
      penetration: new NumberFieldMetadata(
        'penetration',
        'Penetration',
        fieldType.WEAPON
      ),
      rateOfFire: new NumberFieldMetadata(
        'rateOfFire',
        'Rate Of Fire',
        fieldType.WEAPON
      ),
      reload: new NumberFieldMetadata('reload', 'Reload Time', fieldType.WEAPON),
      salvoLength: new NumberFieldMetadata(
        'salvoLength',
        'Salvo Length',
        fieldType.WEAPON
      ),
      static: new NumberFieldMetadata('static', 'Static Accuracy', fieldType.WEAPON),
      supplyCost: new NumberFieldMetadata(
        'supplyCost',
        'Supply Cost',
        fieldType.WEAPON
      ),
      suppress: new NumberFieldMetadata('suppress', 'Suppress', fieldType.WEAPON),
      type: new StringFieldMetadata('type', 'Type', fieldType.WEAPON),
      strength: new NumberFieldMetadata('strength', 'Strength', fieldType.PLATOON),
      optics: new EnumFieldMetadata('optics', 'Optics', fieldType.PLATOON),
      stealth: new EnumFieldMetadata('stealth', 'Stealth', fieldType.PLATOON),
      revealInfluence: new BooleanFieldMetadata(
        'revealInfluence',
        'Reveal Influence',
        fieldType.PLATOON
      ),
      maxDmg: new NumberFieldMetadata('maxDmg', 'Max Dmg.', fieldType.PLATOON),
      airOptics: new EnumFieldMetadata('airOptics', 'Air Optics', fieldType.PLATOON),
      ecm: new NumberFieldMetadata('ecm', 'ECM', fieldType.PLATOON),
      agility: new NumberFieldMetadata('agility', 'Agility', fieldType.PLATOON),
      trajectory: new NumberFieldMetadata(
        'trajectory',
        'Trajectory',
        fieldType.PLATOON
      ),
      speed: new NumberFieldMetadata('speed', 'Speed', fieldType.PLATOON),
      roadSpeed: new NumberFieldMetadata('roadSpeed', 'Road Speed', fieldType.PLATOON),
      autonomy: new NumberFieldMetadata('autonomy', 'Autonomy', fieldType.PLATOON),
      fuel: new NumberFieldMetadata('fuel', 'Fuel', fieldType.PLATOON),
      supply: new NumberFieldMetadata('supplyCost', 'Supply Cost', fieldType.PLATOON),
      transport: new NumberFieldMetadata('transport', 'Transport', fieldType.PLATOON),
    };

    this.metadata = _metadataStore;
  }

  metadata: metadataStore;

  selectedVersions: string[] = ["BESSIERES"];

  currentToast?: IonToast;
  getMetadataAsArray(): AbstractFieldMetadata<unknown>[] {
    const metadataArray: AbstractFieldMetadata<unknown>[] = [];
    for(const key in this.metadata) {
      metadataArray.push(this.metadata[key as keyof metadataStore]);
    }
    return metadataArray
  }

  private async _fetchData() {
    const unitsMetadata: UnitMetadata[] = [];

    const BessieresPromise: Promise<Response> = fetch("/data/warno-units-bessieres.json");
    const MassenaPromise: Promise<Response>  = fetch("/data/warno-units-massena.json");
    const LannesPromise: Promise<Response>  = fetch("/data/warno-units-lannes.json");
    const MuratPromise: Promise<Response>  = fetch("/data/warno-units-murat.json");

    await Promise.all([BessieresPromise, MassenaPromise, LannesPromise, MuratPromise]);
    try {
      let index = 1;

      const BessieresJson = await (await BessieresPromise).json();
      for (const unit of BessieresJson) {
        const unitMetadata: UnitMetadata = this.convertJsonToMetadata(unit, index, "BESSIERES");
        unitsMetadata.push(unitMetadata);
        index++;
      }

      const MassenaJson = await (await MassenaPromise).json();
      for (const unit of MassenaJson) {
        const unitMetadata: UnitMetadata = this.convertJsonToMetadata(unit, index, "MASSENA");
        unitsMetadata.push(unitMetadata);
        index++;
      }

      const LannesJson = await (await LannesPromise).json();
      for (const unit of LannesJson) {
        const unitMetadata: UnitMetadata = this.convertJsonToMetadata(unit, index, "LANNES");
        unitsMetadata.push(unitMetadata);
        index++;
      }

      const MuratJson = await (await MuratPromise).json();
      for(const unit of MuratJson) {
        const unitMetadata: UnitMetadata = this.convertJsonToMetadata(unit, index, "MURAT");
        unitsMetadata.push(unitMetadata);
        index++
      }

      return unitsMetadata;
    } catch (err) {
      console.error(err);
      return [];
    }
  }
  private _units: UnitMetadata[] = [];

  private convertJsonToMetadata(unit: any, id: number, version: string) {
    const weapons: WeaponMetadata[] = [];
    for (const weaponName of ['weaponOne', 'weaponTwo', 'weaponThree']) {
      const weapon: WeaponMetadata = {
        aiming: this.metadata.aiming.deserialize(
          unit[`${weaponName}_aiming`]
        ),
        aircraft: this.metadata.aircraft.deserialize(
          unit[`${weaponName}_aircraft`]
        ),
        ammunition: this.metadata.ammunition.deserialize(
          unit[`${weaponName}_ammunition`]
        ),
        ground: this.metadata.ground.deserialize(
          unit[`${weaponName}_ground`]
        ),
        he: this.metadata.he.deserialize(unit[`${weaponName}_he`]),
        helicopter: this.metadata.helicopter.deserialize(
          unit[`${weaponName}_helicopter`]
        ),
        motion: this.metadata.motion.deserialize(
          unit[`${weaponName}_motion`]
        ),
        name: this.metadata.weaponName.deserialize(
          unit[`${weaponName}_name`]
        ),
        penetration: this.metadata.penetration.deserialize(
          unit[`${weaponName}_penetration`]
        ),
        rateOfFire: this.metadata.rateOfFire.deserialize(
          unit[`${weaponName}_rateOfFire`]
        ),
        reload: this.metadata.reload.deserialize(
          unit[`${weaponName}_reload`]
        ),
        salvoLength: this.metadata.salvoLength.deserialize(
          unit[`${weaponName}_salvoLength`]
        ),
        static: this.metadata.static.deserialize(
          unit[`${weaponName}_static`]
        ),
        supplyCost: this.metadata.supplyCost.deserialize(
          unit[`${weaponName}_supplyCost`]
        ),
        suppress: this.metadata.suppress.deserialize(
          unit[`${weaponName}_suppress`]
        ),
        type: this.metadata.type.deserialize(unit[`${weaponName}_type`]),
      };
      weapons.push(weapon);
    }

    const unitMetadata: UnitMetadata = new UnitMetadata({
      id: `${id}`,
      name: this.metadata.name.deserialize(unit.name),
      commandPoints: this.metadata.commandPoints.deserialize(
        unit.commandPoints
      ),
      frontArmor: this.metadata.frontArmor.deserialize(unit.frontArmor),
      rearArmor: this.metadata.rearArmor.deserialize(unit.rearArmor),
      sideArmor: this.metadata.sideArmor.deserialize(unit.sideArmor),
      topArmor: this.metadata.topArmor.deserialize(unit.topArmor),
      strength: this.metadata.strength.deserialize(unit.strength),
      optics: this.metadata.optics.deserialize(unit.optics),
      stealth: this.metadata.stealth.deserialize(unit.stealth),
      revealInfluence: this.metadata.revealInfluence.deserialize(
        unit.revealInfluence
      ),
      maxDmg: this.metadata.maxDmg.deserialize(unit.maxDmg),
      airOptics: this.metadata.airOptics.deserialize(unit.airOptics),
      ecm: this.metadata.ecm.deserialize(unit.ecm),
      agility: this.metadata.agility.deserialize(unit.agility),
      trajectory: this.metadata.trajectory.deserialize(unit.trajectory),
      speed: this.metadata.speed.deserialize(unit.speed),
      roadSpeed: this.metadata.roadSpeed.deserialize(unit.roadSpeed),
      autonomy: this.metadata.autonomy.deserialize(unit.autonomy),
      fuel: this.metadata.fuel.deserialize(unit.fuel),
      supply: this.metadata.supply.deserialize(unit.supply),
      transport: this.metadata.transport.deserialize(unit.transport),
      weaponMetadata: weapons,
      version
    });
    return unitMetadata;
  }

  public get units(): UnitMetadata[] {
    const selectedVersions = this.selectedVersions;
    return [...this._units].filter((unit) => selectedVersions.includes(unit.version));
  }

  async getUnits(): Promise<UnitMetadata[]> {
    if (this._units.length > 0) {
      return this._units;
    }

    const units = await this._fetchData();
    this._units = units;

    return units;
  }

  refreshCallbacks: {id: string, callback: (() => void)}[] = [];

  registerCallback(id: string, callback: () => void) {
    this.refreshCallbacks.push({id, callback});
  }

  unregisterCallback(id: string) {
    this.refreshCallbacks = [...this.refreshCallbacks].filter((el) => el.id !== id);
  }

  getUnit(unitId: string): UnitMetadata | null {
    const units = this.units;
    const unit = units.find((el) => el.id === unitId);
    return unit || null;
  }

  getUnitsById(unitIds: string[]): UnitMetadata[] {
    const allUnits = this.units;
    const foundUnits = allUnits.filter((el) => unitIds.includes(el.id));
    return foundUnits;
  }

  findUnitsByName(searchTerm: string): UnitMetadata[] {
    const parsedSearchTerm = latinize(searchTerm).toLowerCase();
    const units = this.units;
    const foundUnits = units.filter((el) => {
      const latinized = latinize(el.name).toLowerCase();
      const normal = el.name.toLowerCase();

      if (
        latinized.includes(parsedSearchTerm) ||
        normal.includes(parsedSearchTerm)
      ) {
        return true;
      }
      return false;
    });

    return foundUnits;
  }

  findFieldMetadataByType(
    type: fieldType
  ): AbstractFieldMetadata<unknown>[] {
    const foundFields: (
      AbstractFieldMetadata<unknown>
    )[] = [];
    for (const key in this.metadata) {
      const fieldMetadata = this.metadata[key as keyof metadataStore];
      if(fieldMetadata.group === type) {
        foundFields.push(fieldMetadata);
      }
    }

    return foundFields
  }

  setUnitVersions(values: string[]) {
    const toast = document.createElement('ion-toast');
    this.currentToast?.dismiss();
    this.currentToast = toast;
    this.selectedVersions = values;

    toast.message = `Changed display units`;
    toast.duration = 2000;

    document.body.appendChild(toast);

    for(const callback of this.refreshCallbacks) {
      callback.callback();
    }

    const applicationElement = document.querySelector("application-route");
    applicationElement?.remove();

    const newApplication = document.createElement("application-route");
    const body = document.querySelector("body");
    body?.appendChild(newApplication);

    return toast.present();
  }
}

const UnitService = new UnitServiceClass();
export {UnitService};
