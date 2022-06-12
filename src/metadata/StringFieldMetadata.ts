import { AbstractFieldMetadata } from "./AbstractFieldMetadata";
import { operator } from "../types";

export class StringFieldMetadata extends AbstractFieldMetadata<string> {
  readonly type = "string"
  deserialize(input: string): string {
    return input
  }
  operators = [operator.LIKE, operator.NOT_LIKE];
}