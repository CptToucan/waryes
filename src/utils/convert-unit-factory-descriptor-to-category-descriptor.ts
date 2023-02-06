import { UnitCategory } from "../types/deck-builder";

type FactoryDescriptorMap = {
  [key: string]: UnitCategory;
};

const factoryDescriptorMap: FactoryDescriptorMap = {
  'EDefaultFactories/Helis': UnitCategory.HEL,
  'EDefaultFactories/Logistic': UnitCategory.LOG,
  'EDefaultFactories/Planes': UnitCategory.AIR,
  'EDefaultFactories/Support': UnitCategory.ART,
  'EDefaultFactories/AT': UnitCategory.AA,
  'EDefaultFactories/Infantry': UnitCategory.INF,
  'EDefaultFactories/Recons': UnitCategory.REC,
  'EDefaultFactories/Tanks': UnitCategory.TNK,
};


export function convertUnitFactoryDescriptorToCategoryDescriptor(descriptor: string): UnitCategory | undefined {
  return factoryDescriptorMap[descriptor];
}