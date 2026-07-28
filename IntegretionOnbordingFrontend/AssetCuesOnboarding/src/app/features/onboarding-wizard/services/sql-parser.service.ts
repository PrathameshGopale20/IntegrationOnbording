import { Injectable } from '@angular/core';
import {
  ITemplateParser,
  ParsedTemplatePayload,
  ParsedTemplateRecord,
} from '../models/import-result.model';

interface SqlInsertStatement {
  readonly tableName: string;
  readonly columns: readonly string[];
  readonly rows: readonly (readonly string[])[];
}

/**
 * Parses AssetCues customer integration SQL scripts into template records.
 * Compatible with scripts like Healthium / Pidilite / Oberoi.
 */
@Injectable({ providedIn: 'root' })
export class SqlParserService implements ITemplateParser {
  readonly format = 'sql' as const;

  canParse(fileName: string, mimeType?: string): boolean {
    const name = fileName.trim().toLowerCase();
    const mime = (mimeType ?? '').trim().toLowerCase();

    if (name.endsWith('.sql') || name.endsWith('.sql.txt')) {
      return true;
    }

    return mime === 'application/sql' || mime === 'text/x-sql';
  }

  parse(content: string): ParsedTemplatePayload {
    const normalized = content.replace(/^\uFEFF/, '');
    if (!normalized.trim()) {
      throw new Error('SQL file is empty.');
    }

    if (!/insert\s+into/i.test(normalized)) {
      throw new Error(
        'SQL file does not contain INSERT INTO statements for a customer integration template.'
      );
    }

    const inserts = this.extractInsertStatements(normalized);
    if (inserts.length === 0) {
      throw new Error('Unable to parse INSERT statements from the SQL script.');
    }

    const companyNamesById = this.extractCompanyNamesFromComments(normalized);
    const records: ParsedTemplateRecord[] = [];

    for (const insert of inserts) {
      records.push(...this.mapInsertToRecords(insert, companyNamesById));
    }

    if (records.length === 0) {
      throw new Error(
        'SQL script was read, but no supported integration tables were found.'
      );
    }

    const hasBasicDetails = records.some((record) => record.section === 'BasicDetails');
    if (!hasBasicDetails) {
      throw new Error(
        'SQL script must include in_integrationcustomerapplications or in_customerintegrations.'
      );
    }

    return {
      sourceFormat: this.format,
      records,
    };
  }

  private mapInsertToRecords(
    insert: SqlInsertStatement,
    companyNamesById: ReadonlyMap<string, string>
  ): ParsedTemplateRecord[] {
    const table = insert.tableName.toLowerCase();

    if (table.includes('in_integrationcustomerapplications')) {
      return this.mapApplicationRows(insert);
    }

    if (table.includes('in_customerintegrations')) {
      return this.mapCustomerIntegrationRows(insert);
    }

    if (table.includes('in_customerintcompanies')) {
      return this.mapCompanyRows(insert, companyNamesById);
    }

    if (table.includes('in_selectedtransactiontypes')) {
      return this.mapRowsAsJsonSection(insert, 'Transactions', 'rows');
    }

    if (table.includes('in_customerendpoints')) {
      return this.mapRowsAsJsonSection(insert, 'Endpoints', 'rows');
    }

    if (table.includes('in_customerfields') && !table.includes('mapping')) {
      return this.mapRowsAsJsonSection(insert, 'CustomerFields', 'rows');
    }

    if (table.includes('in_customerfieldmapping')) {
      return this.mapRowsAsJsonSection(insert, 'FieldMapping', 'rows');
    }

    if (table.includes('in_excludedassetclasses') || table.includes('in_selectedassetcategories')) {
      return this.mapRowsAsJsonSection(insert, 'Configurations', 'assetClasses');
    }

    if (table.includes('in_schedulefrequency') || table.includes('in_scheduleinstances')) {
      const field = table.includes('frequency') ? 'frequencies' : 'instances';
      return this.mapRowsAsJsonSection(insert, 'Scheduler', field);
    }

    if (table.includes('in_ftpserverpaths') || table.includes('master')) {
      return this.mapRowsAsJsonSection(insert, 'MasterMapping', 'rows');
    }

    return [];
  }

  private mapApplicationRows(insert: SqlInsertStatement): ParsedTemplateRecord[] {
    const row = insert.rows[0];
    if (!row) {
      return [];
    }

    const values = this.rowToObject(insert.columns, row);
    return this.toRecords('BasicDetails', {
      customerId: values['customerid'],
      customerName: values['customername'],
      tenantId: values['tenantid'],
      integrationTypeId: values['integrationtypeid'],
      applicationId: values['applicationid'],
      isEnabled: values['isenabled'] || 'true',
    });
  }

  private mapCustomerIntegrationRows(insert: SqlInsertStatement): ParsedTemplateRecord[] {
    const row = insert.rows[0];
    if (!row) {
      return [];
    }

    const values = this.rowToObject(insert.columns, row);
    const integrationType = (values['integrationtype'] || '').toUpperCase();
    const accessApproach =
      integrationType === 'API' || integrationType === 'FTP'
        ? integrationType
        : values['accessapproach'] || '';

    const basicDetails = this.toRecords('BasicDetails', {
      customerId: values['customerid'],
      customerName: values['customername'],
      tenantId: values['tenantid'],
      applicationId: values['applicationid'],
      accessApproach,
      isEnabled: 'true',
    });

    const credentials = this.toRecords('Credentials', {
      clientApiKey: values['clientapikey'],
      clientSecret: values['clientsecret'],
      clientEndpoint: values['clientendpoint'],
      clientPayload: values['clientpayload'] || '{}',
      mode: values['mode'],
      fiscalYear: values['fiscalyear'],
      wdvYear: values['wdvyear'],
      wdvPeriod: values['wdvperiod'],
      authenticationType: values['authenticationtype'] || 'None',
      erpClientId: this.nullSafe(values['erpclientid']),
      erpClientSecret: this.nullSafe(values['erpclientsecret']),
      erpTokenUrl: this.nullSafe(values['erptokenurl']),
      ftpSftpHost: this.nullSafe(values['ftpsftphost']),
      ftpSftpPort: this.nullSafe(values['ftpsftpport']),
      ftpSftpProtocol: this.nullSafe(values['ftpsftpprotocol']) || 'SFTP',
      ftpUsername: this.nullSafe(values['ftpusername']),
      ftpEncryptedPassword: this.nullSafe(values['ftpencryptedpassword']),
      ftpPrivateKey: this.nullSafe(values['ftpprivatekey']),
      ftpPassphrase: this.nullSafe(values['ftppassphrase']),
    });

    return [...basicDetails, ...credentials];
  }

  private mapCompanyRows(
    insert: SqlInsertStatement,
    companyNamesById: ReadonlyMap<string, string>
  ): ParsedTemplateRecord[] {
    const records: ParsedTemplateRecord[] = [];

    insert.rows.forEach((row, index) => {
      const values = this.rowToObject(insert.columns, row);
      const companyId = values['companyid'] || '';
      const companyName =
        companyNamesById.get(companyId) ||
        values['companyname'] ||
        values['companycode'] ||
        `Company ${index + 1}`;

      const isActiveRaw = (values['isintegrationactive'] || 'A').toUpperCase();
      const isActive = isActiveRaw === 'A' || isActiveRaw === 'TRUE' || isActiveRaw === '1';

      records.push(
        ...this.toRecords('Companies', {
          [`${index}.companyId`]: companyId,
          [`${index}.companyName`]: companyName,
          [`${index}.companyCode`]: values['companycode'] || '',
          [`${index}.fileExtension`]: values['fileextension'] || '',
          [`${index}.delimiter`]: values['delimeter'] || values['delimiter'] || '',
          [`${index}.qualifier`]: values['qualifier'] || '',
          [`${index}.isActive`]: String(isActive),
        })
      );
    });

    return records;
  }

  private mapRowsAsJsonSection(
    insert: SqlInsertStatement,
    section: string,
    field: string
  ): ParsedTemplateRecord[] {
    const rows = insert.rows.map((row) => this.rowToObject(insert.columns, row));
    return [
      {
        section,
        field,
        value: JSON.stringify(rows),
      },
    ];
  }

  private toRecords(
    section: string,
    values: Record<string, string | undefined>
  ): ParsedTemplateRecord[] {
    return Object.entries(values)
      .filter(([, value]) => value !== undefined && value !== '')
      .map(([field, value]) => ({
        section,
        field,
        value: value as string,
      }));
  }

  private nullSafe(value: string | undefined): string {
    if (!value || value.toLowerCase() === 'null') {
      return '';
    }
    return value;
  }

  private rowToObject(
    columns: readonly string[],
    values: readonly string[]
  ): Record<string, string> {
    const result: Record<string, string> = {};
    columns.forEach((column, index) => {
      result[column] = values[index] ?? '';
    });
    return result;
  }

  private extractCompanyNamesFromComments(content: string): Map<string, string> {
    const map = new Map<string, string>();

    // Healthium-style:
    // --"companyid" "companycode" "company"
    // --1348 "1000" "Healthium Medtech Limited"
    const lines = content.split(/\r?\n/);
    for (let i = 0; i < lines.length - 1; i++) {
      const header = lines[i].trim().toLowerCase();
      if (header.includes('companyid') && header.includes('company')) {
        const dataLine = lines[i + 1].replace(/^--+/, '').trim();
        const parts = this.splitCommentColumns(dataLine);
        if (parts.length >= 3) {
          map.set(parts[0].replace(/"/g, ''), parts[2].replace(/"/g, ''));
        }
      }
    }

    // Pidilite-style header comments:
    // -- Company ID  : 1404
    const companyIdMatch = /company\s*id\s*[:=]\s*(\d+)/i.exec(content);
    const customerNameMatch =
      /customer(?:name)?\s*[:=]\s*([A-Za-z0-9 _-]+)/i.exec(content) ||
      /---\s*customername\s*=\s*([^\r\n]+)/i.exec(content);

    if (companyIdMatch && customerNameMatch && !map.has(companyIdMatch[1])) {
      map.set(companyIdMatch[1], customerNameMatch[1].trim());
    }

    return map;
  }

  private splitCommentColumns(line: string): string[] {
    const matches = line.match(/"[^"]*"|[^\s"]+/g);
    return matches ?? [];
  }

  private extractInsertStatements(content: string): SqlInsertStatement[] {
    const statements: SqlInsertStatement[] = [];
    const withoutBlockComments = content.replace(/\/\*[\s\S]*?\*\//g, ' ');
    const insertPattern =
      /INSERT\s+INTO\s+([`"[\w.]+)\s*\(([^)]+)\)\s*VALUES\s*/gi;

    let match: RegExpExecArray | null;
    while ((match = insertPattern.exec(withoutBlockComments)) !== null) {
      const tableName = this.normalizeIdentifier(match[1]);
      const columns = match[2]
        .split(',')
        .map((column) => this.normalizeIdentifier(column))
        .filter((column) => column.length > 0);

      const valuesStart = match.index + match[0].length;
      const valuesChunk = this.readUntilStatementEnd(withoutBlockComments, valuesStart);
      const rows = this.parseValueTuples(valuesChunk);

      if (columns.length > 0 && rows.length > 0) {
        statements.push({ tableName, columns, rows });
      }
    }

    return statements;
  }

  private readUntilStatementEnd(content: string, startIndex: number): string {
    let inSingle = false;
    let inDouble = false;

    for (let i = startIndex; i < content.length; i++) {
      const char = content[i];
      const next = content[i + 1];

      if (inSingle) {
        if (char === "'" && next === "'") {
          i++;
          continue;
        }
        if (char === "'") {
          inSingle = false;
        }
        continue;
      }

      if (inDouble) {
        if (char === '"' && next === '"') {
          i++;
          continue;
        }
        if (char === '"') {
          inDouble = false;
        }
        continue;
      }

      if (char === "'") {
        inSingle = true;
        continue;
      }

      if (char === '"') {
        inDouble = true;
        continue;
      }

      if (char === ';') {
        return content.slice(startIndex, i);
      }
    }

    return content.slice(startIndex);
  }

  private parseValueTuples(valuesChunk: string): string[][] {
    const rows: string[][] = [];
    let i = 0;

    while (i < valuesChunk.length) {
      while (i < valuesChunk.length && /[\s,]/.test(valuesChunk[i])) {
        i++;
      }

      // Skip line comments inside VALUES
      if (valuesChunk.startsWith('--', i)) {
        while (i < valuesChunk.length && valuesChunk[i] !== '\n') {
          i++;
        }
        continue;
      }

      if (valuesChunk[i] !== '(') {
        i++;
        continue;
      }

      i++; // skip '('
      const row: string[] = [];
      let cell = '';
      let inSingle = false;
      let inDouble = false;
      let depth = 0;

      for (; i < valuesChunk.length; i++) {
        const char = valuesChunk[i];
        const next = valuesChunk[i + 1];

        if (inSingle) {
          if (char === "'" && next === "'") {
            cell += "'";
            i++;
            continue;
          }
          if (char === "'") {
            inSingle = false;
            continue;
          }
          cell += char;
          continue;
        }

        if (inDouble) {
          if (char === '"' && next === '"') {
            cell += '"';
            i++;
            continue;
          }
          if (char === '"') {
            inDouble = false;
            continue;
          }
          cell += char;
          continue;
        }

        if (char === "'") {
          inSingle = true;
          continue;
        }

        if (char === '"') {
          inDouble = true;
          continue;
        }

        if (char === '(') {
          depth++;
          cell += char;
          continue;
        }

        if (char === ')' && depth > 0) {
          depth--;
          cell += char;
          continue;
        }

        if (char === ',' && depth === 0) {
          row.push(this.normalizeSqlValue(cell));
          cell = '';
          continue;
        }

        if (char === ')' && depth === 0) {
          row.push(this.normalizeSqlValue(cell));
          rows.push(row);
          i++;
          break;
        }

        // Skip inline comments
        if (char === '-' && next === '-') {
          while (i < valuesChunk.length && valuesChunk[i] !== '\n') {
            i++;
          }
          continue;
        }

        cell += char;
      }
    }

    return rows;
  }

  private normalizeSqlValue(raw: string): string {
    const trimmed = raw.trim();
    if (!trimmed) {
      return '';
    }

    const lower = trimmed.toLowerCase();
    if (lower === 'null') {
      return '';
    }

    if (lower === 'true' || lower === 'false') {
      return lower;
    }

    if (/^now\s*\(\s*\)$/i.test(trimmed)) {
      return new Date().toISOString();
    }

    return trimmed;
  }

  private normalizeIdentifier(raw: string): string {
    return raw
      .trim()
      .replace(/^\[|\]$/g, '')
      .replace(/^"|"$/g, '')
      .replace(/^`|`$/g, '')
      .toLowerCase();
  }
}
