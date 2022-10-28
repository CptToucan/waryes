import {FilterOperator, operatorMap} from '../types/filter';
import { Unit } from '../types/unit';
import {AbstractFieldMetadata} from './AbstractFieldMetadata';

export class FilterMetadata<T> {
  constructor(field: AbstractFieldMetadata<unknown>) {
    this.field = field;
    this.operator = field.operators[0];
  }
  field: AbstractFieldMetadata<unknown>;
  operator?: FilterOperator;
  value?: T | T[];

  get availableOperators(): FilterOperator[] {
    return this.field?.operators || [];
  }

  getFilterFunctionForOperator() {
    if (this.operator) {
      return this.filterFunctions[this.operator];
    }
    return this.filterFunctions[FilterOperator.EQUALS];
  }

  filterFunctions: operatorMap = {
    [FilterOperator.EQUALS]: (filter: FilterMetadata<unknown>) => {
      return (unit: Unit) => {
        return (
          filter.field.deserialize(<string>filter.value) ===
          unit[filter.field.id as keyof Unit]
        );
      };
    },
    [FilterOperator.NOT_EQUAL]: (filter: FilterMetadata<unknown>) => {
      return (unit: Unit) => {
        return (
          filter.field.deserialize(<string>filter.value) !==
          unit[filter.field.id as keyof Unit]
        );
      };
    },
    [FilterOperator.LIKE]: (filter: FilterMetadata<unknown>) => {
      return (unit: Unit) => {
        return (<string>unit[filter.field.id as keyof Unit])
          .toLowerCase()
          .includes(
            (<string>(
              filter.field.deserialize(<string>filter.value)
            )).toLowerCase()
          );
      };
    },
    [FilterOperator.NOT_LIKE]: (filter: FilterMetadata<unknown>) => {
      return (unit: Unit) => {
        return !(<string>unit[filter.field.id as keyof Unit])
          .toLowerCase()
          .includes(
            (<string>(
              filter.field.deserialize(<string>filter.value)
            )).toLowerCase()
          );
      };
    },
    [FilterOperator.GREATER_THAN]: (filter: FilterMetadata<unknown>) => {
      return (unit: Unit) => {
        return (
          <number>filter.field.deserialize(<string>filter.value) <
          (unit[filter.field.id as keyof Unit] || 0)
        );
      };
    },
    [FilterOperator.LESS_THAN]: (filter: FilterMetadata<unknown>) => {
      return (unit: Unit) => {
        return (
          <number>filter.field.deserialize(<string>filter.value) >
          (unit[filter.field.id as keyof Unit] || 0)
        );
      };
    },
    /*
    [FilterOperator.RANGE]: (filter: FilterMetadata<unknown>) => {
      return (unit: Unit) => {
        return (
          filter.field.deserialize(<string>filter.value) ===
          unit[filter.field.id as keyof Unit]
        );
      };
    },
    */
    [FilterOperator.IN_LIST]: (filter: FilterMetadata<unknown>) => {
      return (unit: Unit) => {
        return (
          filter.field.deserialize(<string>filter.value) ===
          unit[filter.field.id as keyof Unit]
        );
      };
    },
    [FilterOperator.NOT_IN_LIST]: (filter: FilterMetadata<unknown>) => {
      return (unit: Unit) => {
        return (
          filter.field.deserialize(<string>filter.value) ===
          unit[filter.field.id as keyof Unit]
        );
      };
    },
  };
}