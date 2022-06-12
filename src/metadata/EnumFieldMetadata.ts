import { AbstractFieldMetadata } from "./AbstractFieldMetadata";
import { quality, operator } from "../types";

export class EnumFieldMetadata extends AbstractFieldMetadata<quality> {
  readonly type = "enum";
  deserialize(input: string): quality {
    const castInput = input as quality;
    return castInput
  }
  operators = [operator.IN_LIST, operator.NOT_IN_LIST];
}