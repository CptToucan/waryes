import {ArmouryCardVeterancyOptions} from '../components/deck/armoury-card';

export function getQuantitiesForUnitVeterancies(
  veterancyOptions: ArmouryCardVeterancyOptions
) {
  const numberOfUnitsInPacksAfterXPMultiplier =
    veterancyOptions.unitQuantityMultipliers.map((multiplier) =>
      Math.round(multiplier * (veterancyOptions?.defaultUnitQuantity || 0))
    );

  return numberOfUnitsInPacksAfterXPMultiplier;
}
