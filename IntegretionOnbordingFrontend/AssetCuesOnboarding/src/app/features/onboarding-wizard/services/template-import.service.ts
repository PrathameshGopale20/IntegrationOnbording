import { Injectable, inject } from '@angular/core';
import { ImportResult, ITemplateParser } from '../models/import-result.model';
import { mapParsedTemplateToOnboardingModel } from '../utils/wizard-template.mapper';
import { CsvParserService } from './csv-parser.service';
import { SqlParserService } from './sql-parser.service';

/**
 * Orchestrates template file import.
 * Swap/add parsers (JSON, Excel, DB) without changing wizard UI code.
 */
@Injectable({ providedIn: 'root' })
export class TemplateImportService {
  private readonly csvParser = inject(CsvParserService);
  private readonly sqlParser = inject(SqlParserService);

  async importFile(file: File): Promise<ImportResult> {
    if (!file) {
      return { success: false, errors: ['No file selected.'] };
    }

    try {
      const content = await this.readFileAsText(file);
      const parser = this.resolveParser(file, content);

      if (!parser) {
        return {
          success: false,
          errors: [
            `Unsupported file "${file.name}". Please upload a .csv template (Section,Field,Value) or a .sql integration script.`,
          ],
        };
      }

      const payload = parser.parse(content);
      const mapped = mapParsedTemplateToOnboardingModel(payload);

      return {
        success: true,
        fileName: file.name,
        sourceFormat: payload.sourceFormat,
        importedSections: mapped.importedSections,
        model: mapped.model,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to import customer template.';
      return { success: false, errors: [message] };
    }
  }

  private resolveParser(file: File, content: string): ITemplateParser | null {
    const matched = this.getParsers().find((parser) =>
      parser.canParse(file.name, file.type)
    );
    if (matched) {
      return matched;
    }

    if (this.looksLikeSqlContent(content) || this.looksLikeSqlFile(file)) {
      return this.sqlParser;
    }

    if (this.looksLikeCsvFile(file) || this.looksLikeTemplateCsvContent(content)) {
      return this.csvParser;
    }

    return null;
  }

  private getParsers(): readonly ITemplateParser[] {
    return [this.sqlParser, this.csvParser];
  }

  private looksLikeSqlFile(file: File): boolean {
    const name = file.name.trim().toLowerCase();
    return name.endsWith('.sql') || name.endsWith('.sql.txt');
  }

  private looksLikeSqlContent(content: string): boolean {
    return /insert\s+into\s+integration\./i.test(content);
  }

  private looksLikeCsvFile(file: File): boolean {
    const name = file.name.trim().toLowerCase();
    const mime = (file.type || '').toLowerCase();

    if (name.endsWith('.csv') || name.endsWith('.csv.txt') || name.includes('.csv.')) {
      return true;
    }

    return (
      mime === 'text/csv' ||
      mime === 'application/csv' ||
      mime === 'text/plain' ||
      mime === 'application/vnd.ms-excel' ||
      mime === 'application/octet-stream'
    );
  }

  private looksLikeTemplateCsvContent(content: string): boolean {
    const firstLine = content
      .replace(/^\uFEFF/, '')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find((line) => line.length > 0);

    if (!firstLine) {
      return false;
    }

    const normalized = firstLine.toLowerCase();
    return (
      normalized.includes('section') &&
      normalized.includes('field') &&
      normalized.includes('value')
    );
  }

  private readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ''));
      reader.onerror = () => reject(new Error('Unable to read the selected file.'));
      reader.readAsText(file);
    });
  }
}
