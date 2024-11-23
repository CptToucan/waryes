import {DamageTable} from '../../services/bundle-manager';
import {Side} from '../../lib/side';
import {Unit, Weapon} from '../../types/unit';
import {FamilyIndexTuple} from '../../types/damageTable';
import extractDamageFamilyProperties from '../../utils/extract-damage-family-properties';
import { REVERSE_TERRAIN_NAMES_MAP } from '../../lib/terrains';

/**
 *
 */
const DROP_OFF = {
  // eslint-disable-next-line camelcase
  DamageTypeEvolutionOverRangeDescriptor_AP1_AC_Helo: 350,
  // eslint-disable-next-line camelcase
  DamageTypeEvolutionOverRangeDescriptor_AP1_1Km: 175,
  // eslint-disable-next-line camelcase
  DamageTypeEvolutionOverRangeDescriptor_Balle_500: 500,
  // eslint-disable-next-line camelcase
  DamageTypeEvolutionOverRangeDescriptor_DCA: 700,
};



export class DamageTableProcessor {
  constructor(private table: DamageTable) {}

  getDamageMultiplier(
    {sourceWeapon, damageFamilyIndex}: {sourceWeapon: Weapon; damageFamilyIndex: number},
    targetUnit: Unit,
    distance: number,
    side: Side,
    terrain: string
  ) {
    const damageTable = this.table;

    const damageDropOffType = sourceWeapon?.damageDropOffTokens[damageFamilyIndex];
    const damageDropOff = damageDropOffType
      ? DROP_OFF[damageDropOffType as keyof typeof DROP_OFF]
      : undefined;

    const damageFamily = extractDamageFamilyProperties(
      sourceWeapon.damageFamilies[damageFamilyIndex]
    );

    const resistanceFamilyString = this.getResistanceFamilyWithIndex(targetUnit, side);
    const resistanceFamily = extractDamageFamilyProperties(resistanceFamilyString);

    if (damageFamily.family === 'ap' && resistanceFamily.family === 'helico') {
      return 0;
    }

    const indexOfTargetResistanceFamilyColumn = this.getIndexOfTargetResistanceFamilyColumn(
      damageTable,
      resistanceFamily.family,
      resistanceFamily.index
    );

    const indexOfDamageFamily = this.getDamageFamilyIndex(damageFamily.family);

    const minIndexOfDamageTable = this.getMinIndexOfDamageTable(indexOfDamageFamily, damageTable);

    let indexesToRemove = this.getNumberOfIndexesToRemove(damageDropOff, distance);

    if (targetUnit.era && sourceWeapon.tandemCharges[damageFamilyIndex]) {
      indexesToRemove -= 2;
    }

    const indexOfDamageFamilyRow = this.getIndexOfDamageFamilyRow(
      minIndexOfDamageTable,
      damageFamily.index,
      indexesToRemove
    );

    const damageTableRow = damageTable?.damageTable?.[indexOfDamageFamilyRow];

    // once we have the damage table row, we need to find the target family to find the column

    const damageMultiplier = damageTableRow?.[indexOfTargetResistanceFamilyColumn];

    const terrainMultiplier = this.getTerrainResistanceMultiplierForDamageFamily(
      terrain,
      damageFamily.family,
      resistanceFamily.family
    );

    return (damageMultiplier || 0) * terrainMultiplier;
  }

  getSuppressionMultiplier(
    {sourceWeapon, damageFamilyIndex}: {sourceWeapon: Weapon; damageFamilyIndex: number},
    targetUnit: Unit,
    side: Side
  ) {
    const damageTable = this.table;

    const damageFamily = extractDamageFamilyProperties(
      sourceWeapon.damageFamilies[damageFamilyIndex]
    );

    const resistanceFamilyString = this.getResistanceFamilyWithIndex(targetUnit, side);
    const resistanceFamily = extractDamageFamilyProperties(resistanceFamilyString);

    if (damageFamily.family === 'ap' && resistanceFamily.family === 'helico') {
      return 0;
    }

    let suppressDamageFamily = damageTable?.defaultSuppressDamage as FamilyIndexTuple;
    const suppressionDamageExceptions = damageTable?.suppressionDamageExceptions || [];
    const suppressionDamageExceptionForDamageFamily = suppressionDamageExceptions.find(
      (suppressionDamageException) => suppressionDamageException.exception === damageFamily.family
    );

    if (suppressionDamageExceptionForDamageFamily) {
      suppressDamageFamily = suppressionDamageExceptionForDamageFamily.suppression;
    }

    const indexOfSuppressDamageFamily = this.getDamageFamilyIndex(
      suppressDamageFamily.family
    );

    const minIndexOfSuppressDamageTable = this.getMinIndexOfDamageTable(
      indexOfSuppressDamageFamily,
      damageTable
    );

    const indexOfSuppressDamageFamilyRow = this.getIndexOfDamageFamilyRow(
      minIndexOfSuppressDamageTable,
      0,
      0
    );

    const suppressDamageTableRow = damageTable?.damageTable?.[indexOfSuppressDamageFamilyRow];

    const indexOfTargetResistanceFamilyColumn = this.getIndexOfTargetResistanceFamilyColumn(
      damageTable,
      resistanceFamily.family,
      resistanceFamily.index
    );

    const suppressDamageMultiplier = suppressDamageTableRow?.[indexOfTargetResistanceFamilyColumn];

    return suppressDamageMultiplier || 0;
  }

  private getIndexOfTargetResistanceFamilyColumn(
    damageTableData: DamageTable,
    resistanceFamily: string,
    resistanceFamilyIndex: number
  ) {
    const indexOfTargetFamily =
      this.findIndexOfFamily(
        damageTableData?.resistanceFamilyWithIndexes as FamilyIndexTuple[],
        resistanceFamily
      ) || 0;

    const minIndexOfResistanceTable = this.getMinIndexOfResistanceTable(
      indexOfTargetFamily,
      damageTableData
    );

    const indexOfTargetResistanceFamilyColumn = minIndexOfResistanceTable + resistanceFamilyIndex;
    return indexOfTargetResistanceFamilyColumn;
  }

  private getMinIndexOfResistanceTable(indexOfTargetFamily: number, damageTableData: DamageTable) {
    let minIndexOfResistanceTable = 0;

    for (let i = 0; i < indexOfTargetFamily; i++) {
      minIndexOfResistanceTable += damageTableData?.resistanceFamilyWithIndexes?.[i]?.maxIndex || 0;
    }
    return minIndexOfResistanceTable;
  }

  private getIndexOfDamageFamilyRow(
    minIndexOfDamageTable: number,
    damageFamilyIndex: number,
    indexesToRemove: number
  ) {
    let indexOfDamageFamilyRow = minIndexOfDamageTable + damageFamilyIndex - indexesToRemove;

    if (indexOfDamageFamilyRow < minIndexOfDamageTable) {
      indexOfDamageFamilyRow = minIndexOfDamageTable;
    }
    return indexOfDamageFamilyRow;
  }

  private getNumberOfIndexesToRemove(damageDropOff: number | undefined, distance: number) {
    let indexesToRemove = 0;

    if (damageDropOff) {
      indexesToRemove = Math.ceil(distance / (damageDropOff || 0) - 1);
    }
    return indexesToRemove;
  }

  private getMinIndexOfDamageTable(indexOfDamageFamily: number, damageTableData: DamageTable) {
    let minIndexOfDamageTable = 0;

    // each record in damageFamilyWithIndexes is a tuple of family and maxIndex
    // the max index is where the current family ends in the damage table
    // so we need to add all the max indexes of the families before the current one
    for (let i = 0; i < indexOfDamageFamily; i++) {
      minIndexOfDamageTable += damageTableData?.damageFamilyWithIndexes?.[i]?.maxIndex || 0;
    }
    return minIndexOfDamageTable;
  }

  findIndexOfFamily(familyIndexTuples: FamilyIndexTuple[], familyToFind: string) {
    return familyIndexTuples.findIndex(
      (familyIndexTuple) => familyIndexTuple.family === familyToFind
    );
  }

  getResistanceFamilyWithIndex(targetUnit: Unit, side: Side) {
    const resistanceFamilyArmorKey = `${side.toLowerCase()}ArmorType` as keyof Unit;
    const resistanceFamilyWithIndex = targetUnit?.[resistanceFamilyArmorKey] as string;
    return resistanceFamilyWithIndex;
  }

  private getDamageFamilyIndex(damageFamily: string) {
    return (
      this.findIndexOfFamily(
        this.table?.damageFamilyWithIndexes as FamilyIndexTuple[],
        damageFamily
      ) || 0
    );
  }

  getTerrainResistanceMultiplierForDamageFamily(
    terrain: string,
    damageFamily: string,
    resistanceFamily: string
  ) {
    const damageTable = this.table;
    const ndfFormOfTerrain =
      REVERSE_TERRAIN_NAMES_MAP[terrain as keyof typeof REVERSE_TERRAIN_NAMES_MAP];

    const terrainMultiplier = damageTable?.terrainResistances?.find((el) => {
      return el.name === ndfFormOfTerrain;
    });

    const damageFamilyMultipliers = terrainMultiplier?.damageFamilies?.find((el) => {
      return el.damageFamily === damageFamily;
    });

    const resistanceFamilyMultiplier = damageFamilyMultipliers?.resistances?.find((el) => {
      return el.type === resistanceFamily;
    });

    if (!terrainMultiplier || !damageFamilyMultipliers || !resistanceFamilyMultiplier) {
      return 1;
    }

    return resistanceFamilyMultiplier.value;
  }
}
