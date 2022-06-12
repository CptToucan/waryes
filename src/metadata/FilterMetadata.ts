import {operator, UnitMetadata, operatorMap} from '../types';
import {AbstractFieldMetadata} from './AbstractFieldMetadata';

export class FilterMetadata<T> {
  constructor(field: AbstractFieldMetadata<unknown>) {
    this.field = field;
    this.operator = field.operators[0];
  }
  field: AbstractFieldMetadata<unknown>;
  operator?: operator;
  value?: T | T[];

  get availableOperators(): operator[] {
    return this.field?.operators || [];
  }

  getFilterFunctionForOperator() {
    if (this.operator) {
      return this.filterFunctions[this.operator];
    }
    return this.filterFunctions[operator.EQUALS];
  }

  filterFunctions: operatorMap = {
    [operator.EQUALS]: (filter: FilterMetadata<unknown>) => {
      return (unit: UnitMetadata) => {
        return (
          filter.field.deserialize(<string>filter.value) ===
          unit[filter.field.id as keyof UnitMetadata]
        );
      };
    },
    [operator.NOT_EQUALS]: (filter: FilterMetadata<unknown>) => {
      return (unit: UnitMetadata) => {
        return (
          filter.field.deserialize(<string>filter.value) !==
          unit[filter.field.id as keyof UnitMetadata]
        );
      };
    },
    [operator.LIKE]: (filter: FilterMetadata<unknown>) => {
      return (unit: UnitMetadata) => {
        return (<string>unit[filter.field.id as keyof UnitMetadata])
          .toLowerCase()
          .includes(
            (<string>(
              filter.field.deserialize(<string>filter.value)
            )).toLowerCase()
          );
      };
    },
    [operator.NOT_LIKE]: (filter: FilterMetadata<unknown>) => {
      return (unit: UnitMetadata) => {
        return !(<string>unit[filter.field.id as keyof UnitMetadata])
          .toLowerCase()
          .includes(
            (<string>(
              filter.field.deserialize(<string>filter.value)
            )).toLowerCase()
          );
      };
    },
    [operator.GREATER_THAN]: (filter: FilterMetadata<unknown>) => {
      return (unit: UnitMetadata) => {
        return (
          <number>filter.field.deserialize(<string>filter.value) <
          unit[filter.field.id as keyof UnitMetadata]
        );
      };
    },
    [operator.LESS_THAN]: (filter: FilterMetadata<unknown>) => {
      return (unit: UnitMetadata) => {
        return (
          <number>filter.field.deserialize(<string>filter.value) >
          unit[filter.field.id as keyof UnitMetadata]
        );
      };
    },
    [operator.RANGE]: (filter: FilterMetadata<unknown>) => {
      return (unit: UnitMetadata) => {
        return (
          filter.field.deserialize(<string>filter.value) ===
          unit[filter.field.id as keyof UnitMetadata]
        );
      };
    },
    [operator.IN_LIST]: (filter: FilterMetadata<unknown>) => {
      return (unit: UnitMetadata) => {
        return (
          filter.field.deserialize(<string>filter.value) ===
          unit[filter.field.id as keyof UnitMetadata]
        );
      };
    },
    [operator.NOT_IN_LIST]: (filter: FilterMetadata<unknown>) => {
      return (unit: UnitMetadata) => {
        return (
          filter.field.deserialize(<string>filter.value) ===
          unit[filter.field.id as keyof UnitMetadata]
        );
      };
    },
  };
}
