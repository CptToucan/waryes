import { UnitCategory } from "../types/deck-builder";

type CategoryEnumMap = {
  [key in UnitCategory]: string;
};

const categoryNamesByEnum: CategoryEnumMap = {
  [UnitCategory.LOG]: 'LOG',
  [UnitCategory.REC]: 'REC',
  [UnitCategory.INF]: 'INF',
  [UnitCategory.TNK]: 'TNK',
  [UnitCategory.ART]: 'ART',
  [UnitCategory.AA]: 'AA',
  [UnitCategory.HEL]: 'HEL',
  [UnitCategory.AIR]: 'AIR',
  [UnitCategory.DEFENSE]: 'DEFENSE',
};

export function getCodeForFactoryDescriptor(
  descriptor: UnitCategory
): string {
  return categoryNamesByEnum[descriptor];
}
