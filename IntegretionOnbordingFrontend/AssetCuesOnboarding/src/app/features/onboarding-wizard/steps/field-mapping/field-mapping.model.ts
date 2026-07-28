export interface FieldMappingItemModel {
  customerField: string;
  standardField: string;
  dbColumn: string;
  sequence: number;
}

export interface FieldMappingStepModel {
  mappings: FieldMappingItemModel[];
}

export function createEmptyFieldMappingItem(): FieldMappingItemModel {
  return {
    customerField: '',
    standardField: '',
    dbColumn: '',
    sequence: 1,
  };
}
