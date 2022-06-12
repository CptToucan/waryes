import { fieldType, operator } from "../types";

export abstract class AbstractFieldMetadata<T> {
  constructor(id: string, label: string, group: fieldType) {
    this.id = id;
    this.label = label;
    this.group = group;
  }
  readonly id: string;
  readonly label: string;
  readonly group: fieldType;
  abstract readonly type: string;
  abstract deserialize(input: string): T;
  readonly abstract operators: operator[];
}