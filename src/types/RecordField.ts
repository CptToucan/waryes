export enum FilterOperator {
  EQUALS = "EQUALS",
  NOT_EQUALS = "NOT_EQUALS",
  GREATER_THAN = "GREATER_THAN",
  LESS_THAN = "LESS_THAN",
  GREATER_THAN_OR_EQUAL = "GREATER_THAN_OR_EQUAL",
  LESS_THAN_OR_EQUAL = "LESS_THAN_OR_EQUAL",
  CONTAINS = "CONTAINS",
  NOT_CONTAINS = "NOT_CONTAINS",
  STARTS_WITH = "STARTS_WITH",
  ENDS_WITH = "ENDS_WITH",
}

export type FieldTypeMetadata = {
  operators: FilterOperator[];
  unit: string
}

const numberOperators: FilterOperator[] = [
  FilterOperator.EQUALS,
  FilterOperator.NOT_EQUALS,
  FilterOperator.GREATER_THAN,
  FilterOperator.LESS_THAN,
  FilterOperator.GREATER_THAN_OR_EQUAL,
  FilterOperator.LESS_THAN_OR_EQUAL,
];

export enum FieldType {
  DISTANCE = "distance",
  PERCENTAGE = "percentage",
  DECIMAL_PERCENTAGE = "decimal_percentage",
  TIME = "time",
  SPEED = "speed",
  PROJECTILE_SPEED = "projectileSpeed",
  PROJECTILE_ACCELERATION = "projectileAcceleration",
  BOOLEAN = "boolean",
  DEFAULT = "default",
  COMPLEX = "complex",
  NUMBER = "number",
  ANGULAR_SPEED = "angular_speed",
  LIQUID = "liquid",

}




const fieldTypes: {
  [key in FieldType]: FieldTypeMetadata
} = {
  [FieldType.DISTANCE]: {
    operators: [
      ...numberOperators
    ],
    unit: "m"
  },
  [FieldType.PERCENTAGE]: {
    operators: [
      ...numberOperators
    ],
    unit: "%"
  },
  [FieldType.DECIMAL_PERCENTAGE]: {
    operators: [
      ...numberOperators
    ],
    unit: "%"
  },
  [FieldType.TIME]: {
    operators: [
      ...numberOperators
    ],
    unit: "s"
  },
  [FieldType.SPEED]: {
    operators: [
      ...numberOperators
    ],
    unit: "km/h"
  },
  [FieldType.PROJECTILE_SPEED]: {
    operators: [
      ...numberOperators
    ],
    unit: "km/h"
  },
  [FieldType.PROJECTILE_ACCELERATION]: {
    operators: [
      ...numberOperators
    ],
    unit: "km/h^2"
  },
  [FieldType.BOOLEAN]: {
    operators: [
      FilterOperator.EQUALS,
      FilterOperator.NOT_EQUALS,
    ],
    unit: ""
  },
  [FieldType.NUMBER]: {
    operators: [
      ...numberOperators
    ],
    unit: ""
  },
  [FieldType.ANGULAR_SPEED]: {
    operators: [
      ...numberOperators
    ],
    unit: "deg/s"
  },
  [FieldType.LIQUID]: {
    operators: [
      ...numberOperators
    ],
    unit: "L"
  },
  [FieldType.DEFAULT]: {
    operators: [
      FilterOperator.EQUALS,
      FilterOperator.NOT_EQUALS,
      FilterOperator.CONTAINS,
      FilterOperator.NOT_CONTAINS,
      FilterOperator.STARTS_WITH,
      FilterOperator.ENDS_WITH,
    ],
    unit: ""
  },
  [FieldType.COMPLEX]: {
    operators: [
    ],
    unit: ""
  },
}

export class RecordField<T> {
  constructor(id: string, label: string, value: T, fieldType: FieldType) {
    this.id = id;
    this.label = label;
    this.value = value;
    this.fieldType = fieldType;
  }

  id: string;
  label: string;
  value: T;
  fieldType: FieldType;

  getFieldId() {
    return this.id;
  }

  getFieldNameDisplay() {
    return this.label;
  }

  getFieldValue() {
    return this.value;
  }

  getFieldValueDisplay() {
    return RecordField.getDisplayForValue(this.value, this.fieldType);
  }

  static getDisplayForValue(value: any, fieldType: FieldType) {
    if (fieldType === FieldType.BOOLEAN) {
      return value ? "Yes" : "No";
    }
    if(fieldType === FieldType.DISTANCE) {
      return `${value} ${fieldTypes[fieldType].unit}`;
    }

    if(fieldType === FieldType.TIME) {
      return `${value} ${fieldTypes[fieldType].unit}`;
    }

    if(fieldType === FieldType.ANGULAR_SPEED) {
      return `${(value / Math.PI) * 90} ${fieldTypes[fieldType].unit}`;
    }

    if(fieldType === FieldType.DECIMAL_PERCENTAGE) {
      return `${value * 100} ${fieldTypes[fieldType].unit}`;
    }

    if(fieldType === FieldType.PERCENTAGE) {
      return `${value} ${fieldTypes[fieldType].unit}`;
    }

    return value;
  }

  getFieldType() {
    return this.fieldType;
  }

  getFieldProperties() {
    return fieldTypes[this.fieldType];
  }
}