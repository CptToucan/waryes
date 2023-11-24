export type FamilyIndexTuple = {
  family: string;
  maxIndex: number;
}

export type TerrainResistance = {
  damageFamily: any;
  resistances: {
    type: any;
    value: number;
  }[];
};