import { AbstractFieldMetadata } from "./AbstractFieldMetadata";
import { operator } from "../types";

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
  operators = [operator.EQUALS, operator.LESS_THAN, operator.GREATER_THAN];
}

