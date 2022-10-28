import { AbstractFieldMetadata } from "./AbstractFieldMetadata";
import { FilterOperator } from "./filter";

export class StringFieldMetadata extends AbstractFieldMetadata<string> {
  readonly type = "string"
  deserialize(input: string): string {
    return input
  }
  operators = [FilterOperator.LIKE, FilterOperator.NOT_LIKE];
}