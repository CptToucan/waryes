import { AbstractFieldMetadata } from "./AbstractFieldMetadata";
import { FilterOperator } from "./filter";

export class NumberFieldMetadata extends AbstractFieldMetadata<number> {
  readonly type = "number"
  deserialize(input: string): number {
    const numberValue: number = parseFloat(input)
    if(isNaN(numberValue)) {
      // @ts-ignore
      return undefined;
    }
    return numberValue;
  }
  operators = [FilterOperator.EQUALS, FilterOperator.LESS_THAN, FilterOperator.GREATER_THAN];
}