import { OnboardingModel } from './onboarding-model';

/**
 * Template import contracts.
 * Parsers (CSV / future JSON / Excel / DB) stay independent of the wizard UI.
 */

export type TemplateSourceFormat = 'csv' | 'json' | 'excel' | 'database' | 'sql';

export interface ParsedTemplateRecord {
  readonly section: string;
  readonly field: string;
  readonly value: string;
}

export interface ParsedTemplatePayload {
  readonly sourceFormat: TemplateSourceFormat;
  readonly records: readonly ParsedTemplateRecord[];
}

export interface ImportSuccessResult {
  readonly success: true;
  readonly fileName: string;
  readonly sourceFormat: TemplateSourceFormat;
  readonly importedSections: readonly string[];
  readonly model: OnboardingModel;
}

export interface ImportFailureResult {
  readonly success: false;
  readonly errors: readonly string[];
}

export type ImportResult = ImportSuccessResult | ImportFailureResult;

export interface ITemplateParser {
  readonly format: TemplateSourceFormat;
  canParse(fileName: string, mimeType?: string): boolean;
  parse(content: string): ParsedTemplatePayload;
}
