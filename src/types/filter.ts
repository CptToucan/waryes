import {FilterMetadata} from './FilterMetadata';
import {Unit} from './unit';

export type FilterOperatorsMap = {
  number: FilterOperator[];
  string: FilterOperator[];
  enum: FilterOperator[];
  boolean: FilterOperator[];
};

export enum FilterOperator {
  EQUALS = 'Equals',
  NOT_EQUAL = "Not Equal",
  LESS_THAN = 'Less Than',
  GREATER_THAN = 'Greater Than',
  LIKE = 'Like',
  NOT_LIKE = 'Not Like',
  IN_LIST = 'In List',
  NOT_IN_LIST = 'Not In List',
}

export type operatorMap = {
  [key in FilterOperator]: (
    filter: FilterMetadata<unknown>
  ) => (value: Unit, index: number, array: Unit[]) => boolean;
};
