import { FilterOperator } from "../types/filter";
import { UnitFieldType } from "./unit";


export abstract class AbstractFieldMetadata<T> {
  constructor(id: string, label: string, fieldType: UnitFieldType) {
    this.id = id;
    this.label = label;
    this.fieldType = fieldType;
  }

  readonly id: string;
  readonly label: string;
  readonly fieldType: UnitFieldType;
  abstract readonly type: string;
  abstract deserialize(input: string): T;
  readonly abstract operators: FilterOperator[];
}