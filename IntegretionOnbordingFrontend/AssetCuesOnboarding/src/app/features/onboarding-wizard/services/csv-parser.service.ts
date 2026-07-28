import { Injectable } from '@angular/core';
import {
  TEMPLATE_CSV_HEADERS,
  TEMPLATE_SECTION_ALIASES,
} from '../constants/template-import.constant';
import {
  ITemplateParser,
  ParsedTemplatePayload,
  ParsedTemplateRecord,
} from '../models/import-result.model';

/**
 * CSV-only parser. Later add JsonParserService / ExcelParserService implementing ITemplateParser.
 */
@Injectable({ providedIn: 'root' })
export class CsvParserService implements ITemplateParser {
  readonly format = 'csv' as const;

  canParse(fileName: string, mimeType?: string): boolean {
    const name = fileName.trim().toLowerCase();
    const mime = (mimeType ?? '').trim().toLowerCase();

    if (
      name.endsWith('.csv') ||
      name.endsWith('.csv.txt') ||
      /\.csv(\.|$)/.test(name)
    ) {
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

  parse(content: string): ParsedTemplatePayload {
    const normalized = content.replace(/^\uFEFF/, '').trim();
    if (!normalized) {
      throw new Error('CSV file is empty.');
    }

    const rows = this.parseCsvRows(normalized);
    if (rows.length < 2) {
      throw new Error('CSV must include a header row and at least one data row.');
    }

    const header = rows[0].map((cell) => cell.trim());
    this.assertHeaders(header);

    const sectionIndex = this.findHeaderIndex(header, 'Section');
    const fieldIndex = this.findHeaderIndex(header, 'Field');
    const valueIndex = this.findHeaderIndex(header, 'Value');

    const records: ParsedTemplateRecord[] = [];

    for (let rowIndex = 1; rowIndex < rows.length; rowIndex++) {
      const row = rows[rowIndex];
      if (row.every((cell) => cell.trim() === '')) {
        continue;
      }

      const rawSection = (row[sectionIndex] ?? '').trim();
      const field = (row[fieldIndex] ?? '').trim();
      const value = row[valueIndex] ?? '';

      if (!rawSection || !field) {
        throw new Error(
          `Invalid CSV at row ${rowIndex + 1}: Section and Field are required.`
        );
      }

      records.push({
        section: this.normalizeSection(rawSection),
        field,
        value,
      });
    }

    if (records.length === 0) {
      throw new Error('CSV contains no importable data rows.');
    }

    return {
      sourceFormat: this.format,
      records,
    };
  }

  private assertHeaders(header: string[]): void {
    const missing = TEMPLATE_CSV_HEADERS.filter(
      (expected) => this.findHeaderIndex(header, expected) < 0
    );

    if (missing.length > 0) {
      throw new Error(
        `Invalid CSV headers. Expected columns: ${TEMPLATE_CSV_HEADERS.join(', ')}.`
      );
    }
  }

  private findHeaderIndex(header: string[], name: string): number {
    return header.findIndex((cell) => cell.toLowerCase() === name.toLowerCase());
  }

  private normalizeSection(section: string): string {
    const key = section.trim().toLowerCase().replace(/\s+/g, '');
    return TEMPLATE_SECTION_ALIASES[key] ?? section.trim();
  }

  /**
   * Minimal RFC4180-style CSV parser (quotes, commas, newlines).
   */
  private parseCsvRows(content: string): string[][] {
    const rows: string[][] = [];
    let row: string[] = [];
    let cell = '';
    let inQuotes = false;

    for (let i = 0; i < content.length; i++) {
      const char = content[i];
      const next = content[i + 1];

      if (inQuotes) {
        if (char === '"' && next === '"') {
          cell += '"';
          i++;
          continue;
        }

        if (char === '"') {
          inQuotes = false;
          continue;
        }

        cell += char;
        continue;
      }

      if (char === '"') {
        inQuotes = true;
        continue;
      }

      if (char === ',') {
        row.push(cell);
        cell = '';
        continue;
      }

      if (char === '\n') {
        row.push(cell);
        rows.push(row);
        row = [];
        cell = '';
        continue;
      }

      if (char === '\r') {
        continue;
      }

      cell += char;
    }

    if (cell.length > 0 || row.length > 0) {
      row.push(cell);
      rows.push(row);
    }

    return rows;
  }
}
