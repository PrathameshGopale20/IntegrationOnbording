export interface MasterMappingItemModel {
  masterName: string;
  sourceField: string;
  targetField: string;
}

export interface MasterMappingStepModel {
  mappings: MasterMappingItemModel[];
}

export function createEmptyMasterMappingItem(): MasterMappingItemModel {
  return {
    masterName: '',
    sourceField: '',
    targetField: '',
  };
}
