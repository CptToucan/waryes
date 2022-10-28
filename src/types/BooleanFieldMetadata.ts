import { AbstractFieldMetadata } from "./AbstractFieldMetadata";
import { FilterOperator } from "./filter";

export class BooleanFieldMetadata extends AbstractFieldMetadata<boolean> {
  readonly type = "boolean"
  deserialize(input: string | boolean): boolean {
    if(typeof input === "boolean") {
      return input
    }
    else if(input.toLowerCase() === "yes") {
      return true;
    }
    return false;
  }

  operators = [FilterOperator.EQUALS];
}