import { Injectable } from '@angular/core';
import { OnboardingModel } from '../models/onboarding-model';
import { CompanyFormModel } from '../steps/companies/companies.model';

export interface GeneratedSqlScript {
  readonly fileName: string;
  readonly content: string;
}

/**
 * Builds AssetCues-style integration SQL scripts from wizard data
 * (same shape as SCRIPT/PIDILITE INTEGRATION SCRIPT.sql / Healthium Integration_Script.sql).
 */
@Injectable({ providedIn: 'root' })
export class SqlGenerationService {
  generate(model: OnboardingModel): GeneratedSqlScript {
    const basic = model.basicDetails;
    if (!basic?.customerId || !basic.customerName || !basic.tenantId) {
      throw new Error('Basic Details (Customer ID, Name, Tenant ID) are required before Submit.');
    }

    const customerId = basic.customerId.trim();
    const customerName = basic.customerName.trim();
    const tenantId = basic.tenantId.trim();
    const integrationTypeId = basic.integrationTypeId ?? 1;
    const applicationId = basic.applicationId ?? 1;
    const credentials = model.credentials;
    const companies = model.companies?.companies ?? [];
    const transactions = (model.transactions?.transactions ?? []).filter(
      (item) => item.selected || item.enabled
    );
    const endpoints = model.endpoints?.endpoints ?? [];
    const fields = model.customerFields?.fields ?? [];
    const mappings = model.fieldMapping?.mappings ?? [];
    const assetClasses = model.configurations?.assetClasses ?? [];
    const scheduler = model.scheduler;

    const appId = this.toStableId(customerId, 1000);
    const customerIntId = appId;
    const companyBaseId = appId * 10;
    const txnBaseId = appId * 100;
    const endpointBaseId = appId * 1000;
    const fieldBaseId = appId * 10 + 50;
    const mappingBaseId = appId * 10000;
    const scheduleBaseId = appId + 20;

    const companyRows = companies.map((company, index) => ({
      companyRowId: companyBaseId + index + 1,
      company,
    }));
    const primaryCompanyRowId = companyRows[0]?.companyRowId ?? companyBaseId + 1;

    const txnRows = transactions.map((txn, index) => ({
      selectedTransactionId: txnBaseId + index + 1,
      txn,
    }));

    const sections: string[] = [];
    sections.push(this.buildHeader(customerName, customerId, tenantId, companies));
    sections.push(this.separator());
    sections.push(
      this.buildCustomerApplications(
        appId,
        customerId,
        tenantId,
        customerName,
        integrationTypeId,
        applicationId,
        basic.isEnabled
      )
    );
    sections.push(this.separator());
    sections.push(
      this.buildCustomerIntegrations(
        customerIntId,
        customerId,
        customerName,
        tenantId,
        applicationId,
        appId,
        credentials,
        basic.accessApproach
      )
    );

    if (assetClasses.length > 0) {
      sections.push(this.separator());
      sections.push(
        this.buildExcludedAssetClasses(assetClasses, customerIntId, customerId, tenantId, appId)
      );
    }

    if (companyRows.length > 0) {
      sections.push(this.separator());
      sections.push(
        this.buildCompanies(companyRows, customerIntId, customerId, tenantId)
      );
    }

    if (txnRows.length > 0) {
      sections.push(this.separator());
      sections.push(
        this.buildTransactions(
          txnRows,
          appId,
          customerId,
          tenantId,
          primaryCompanyRowId,
          integrationTypeId
        )
      );
    }

    if (endpoints.length > 0) {
      sections.push(this.separator());
      sections.push(
        this.buildEndpoints(
          endpoints,
          txnRows,
          customerIntId,
          primaryCompanyRowId,
          customerId,
          tenantId,
          endpointBaseId,
          integrationTypeId
        )
      );
    }

    if (scheduler) {
      sections.push(this.separator());
      sections.push(
        this.buildScheduler(scheduler, scheduleBaseId, integrationTypeId, customerId, tenantId)
      );
    }

    if (fields.length > 0) {
      sections.push(this.separator());
      sections.push(
        this.buildCustomerFields(
          fields,
          fieldBaseId,
          customerIntId,
          primaryCompanyRowId,
          customerId,
          tenantId
        )
      );
    }

    if (mappings.length > 0) {
      sections.push(this.separator());
      sections.push(
        this.buildFieldMappings(
          mappings,
          mappingBaseId,
          endpoints,
          fields,
          fieldBaseId,
          endpointBaseId,
          txnRows,
          customerIntId,
          primaryCompanyRowId,
          customerId,
          tenantId
        )
      );
    }

    const content = `${sections.filter(Boolean).join('\n')}\n`;
    const safeName = customerName.replace(/[<>:"/\\|?*]/g, '').trim() || 'Customer';
    const fileName = `${safeName} Integration_Script.sql`;

    return { fileName, content };
  }

  download(script: GeneratedSqlScript): void {
    const blob = new Blob([script.content], { type: 'application/sql;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = script.fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  private buildHeader(
    customerName: string,
    customerId: string,
    tenantId: string,
    companies: CompanyFormModel[]
  ): string {
    const companyLines = companies
      .map(
        (company) =>
          `-- ${company.companyId || '-'}    ${company.companyCode || '-'}    ${company.companyName || '-'}`
      )
      .join('\n');

    return `
-- =========================================================
-- ${customerName.toUpperCase()} INTEGRATION SCRIPT
-- Customer ID : ${customerId}
-- Tenant      : ${tenantId}
-- Generated   : ${new Date().toISOString()}
-- =========================================================
-- companyid    companycode    company
${companyLines || '-- (no companies)'}
`.trim();
  }

  private buildCustomerApplications(
    appId: number,
    customerId: string,
    tenantId: string,
    customerName: string,
    integrationTypeId: number,
    applicationId: number,
    isEnabled: boolean
  ): string {
    return `
INSERT INTO integration.in_integrationcustomerapplications(customerapplicationsid, customerid, tenantid, customername, integrationtypeid, applicationid, isenabled, createdby, creationdate, updatedby, updatedate) VALUES
    (${appId}, ${this.sqlNumber(customerId)}, ${this.sqlString(tenantId)}, ${this.sqlString(customerName)}, ${integrationTypeId}, ${applicationId}, ${isEnabled}, 1, now(), 1, now());
`.trim();
  }

  private buildCustomerIntegrations(
    customerIntId: number,
    customerId: string,
    customerName: string,
    tenantId: string,
    applicationId: number,
    appId: number,
    credentials: OnboardingModel['credentials'],
    accessApproach: string
  ): string {
    const cred = credentials;
    const integrationType =
      accessApproach?.toUpperCase() === 'FTP' || accessApproach?.toUpperCase() === 'API'
        ? accessApproach.toUpperCase()
        : 'API';

    return `
INSERT INTO integration.in_customerintegrations(customerintid, customerid, customername, tenantid, fiscalyear, wdvyear, wdvperiod, clientsecret, clientapikey, clientendpoint, clientpayload, applicationid, integrationtype, erpclientsecret, erpclientid, erptokenurl, ftpsftphost, ftpsftpport, ftpsftpprotocol, accessapproach, ftpusername, ftpencryptedpassword, ftpprivatekey, ftppassphrase, mode, customerapplicationsid, selectedtransactionid, createdby, creationdate, updatedby, updatedate) VALUES
    (${customerIntId}, ${this.sqlNumber(customerId)}, ${this.sqlString(customerName)}, ${this.sqlString(tenantId)}, ${this.sqlString(cred?.fiscalYear || '')}, ${this.sqlString(cred?.wdvYear || '')}, ${this.sqlString(cred?.wdvPeriod || '')}, ${this.sqlString(cred?.clientSecret || '')}, ${this.sqlString(cred?.clientApiKey || '')}, ${this.sqlString(cred?.clientEndpoint || '')}, ${this.sqlString(cred?.clientPayload || '{}')}, ${applicationId}, ${this.sqlString(integrationType)}, ${this.sqlNullableString(cred?.erpClientSecret)}, ${this.sqlNullableString(cred?.erpClientId)}, ${this.sqlNullableString(cred?.erpTokenUrl)}, ${this.sqlNullableString(cred?.ftpSftpHost)}, ${this.sqlNullableNumber(cred?.ftpSftpPort)}, ${this.sqlNullableString(cred?.ftpSftpProtocol)}, ${this.sqlNullableString(accessApproach || null)}, ${this.sqlNullableString(cred?.ftpUsername)}, ${this.sqlNullableString(cred?.ftpEncryptedPassword)}, ${this.sqlNullableString(cred?.ftpPrivateKey)}, ${this.sqlNullableString(cred?.ftpPassphrase)}, ${this.sqlNullableString(cred?.mode)}, ${appId}, null, 1, now(), 1, now());
`.trim();
  }

  private buildExcludedAssetClasses(
    assetClasses: NonNullable<OnboardingModel['configurations']>['assetClasses'],
    customerIntId: number,
    customerId: string,
    tenantId: string,
    baseId: number
  ): string {
    const rows = assetClasses.map((item, index) => {
      const id = baseId * 20 + index + 1;
      return `\t(${id}, ${customerIntId}, ${this.sqlString(item.assetClassCode)}, ${this.sqlString(item.assetClass)}, ${this.sqlString(item.assetClassMode || 'I')}, ${this.sqlNumber(customerId)}, ${this.sqlString(tenantId)}, 1, now(), 1, now())`;
    });

    return `
INSERT INTO integration.in_ExcludedAssetClasses
(excludedassetclassid, customerintid, assetclasscode, assetclass, assetclassmode, customerid, tenantid, createdby, creationdate, updatedby, updatedate)
VALUES
${rows.join(',\n')};
`.trim();
  }

  private buildCompanies(
    companyRows: Array<{ companyRowId: number; company: { companyId: string; companyCode: string; fileExtension: string; delimiter: string; qualifier: string; isActive: boolean } }>,
    customerIntId: number,
    customerId: string,
    tenantId: string
  ): string {
    const rows = companyRows.map(({ companyRowId, company }) => {
      const active = company.isActive ? 'A' : 'I';
      const ext = company.fileExtension?.startsWith('.')
        ? company.fileExtension
        : company.fileExtension
          ? `.${company.fileExtension}`
          : '.csv';
      return `\t(${companyRowId}, ${customerIntId}, ${this.sqlNumber(company.companyId || '0')}, ${this.sqlString(company.companyCode)}, ${this.sqlString(ext)}, ${this.sqlString(active)}, ${this.sqlString(company.delimiter || '~')}, ${this.sqlString(company.qualifier || '"')}, ${this.sqlNumber(customerId)}, ${this.sqlString(tenantId)}, 1, now(), 1, now())`;
    });

    return `
INSERT INTO integration.in_customerintcompanies(customerintcompanyid, customerintid, companyid, companycode, fileextension, isintegrationactive, delimeter, qualifier, customerid, tenantid, createdby, creationdate, updatedby, updatedate) VALUES
${rows.join(',\n')};
`.trim();
  }

  private buildTransactions(
    txnRows: Array<{
      selectedTransactionId: number;
      txn: {
        transactionTypeId: number | null;
        tcode: string;
        enabled: boolean;
      };
    }>,
    appId: number,
    customerId: string,
    tenantId: string,
    companyRowId: number,
    integrationTypeId: number
  ): string {
    const rows = txnRows.map(({ selectedTransactionId, txn }) => {
      return `\t(${selectedTransactionId}, ${appId}, ${this.sqlNumber(customerId)}, ${this.sqlString(tenantId)}, ${companyRowId}, ${txn.transactionTypeId ?? 'NULL'}, ${integrationTypeId}, ${this.sqlString(txn.tcode)}, NULL, ${txn.enabled}, 1, now(), 1, now())`;
    });

    return `
INSERT INTO integration.in_selectedtransactiontypes ("selectedtransactionid", "customerapplicationsid", "customerid", "tenantid", "customerintcompanyid", "transactiontypeid", "integrationtypeid", "tcode", "creationtriggerid", "isenabled", "createdby", "creationdate", "updatedby", "updatedate") VALUES
${rows.join(',\n')};
`.trim();
  }

  private buildEndpoints(
    endpoints: NonNullable<OnboardingModel['endpoints']>['endpoints'],
    txnRows: Array<{ selectedTransactionId: number; txn: { tcode: string; transactionName: string } }>,
    customerIntId: number,
    companyRowId: number,
    customerId: string,
    tenantId: string,
    endpointBaseId: number,
    integrationTypeId: number
  ): string {
    const rows = endpoints.map((endpoint, index) => {
      const endpointId = endpointBaseId + index + 1;
      const selectedTxnId =
        Number(endpoint.selectedTransactionId) ||
        txnRows.find(
          (row) =>
            row.txn.transactionName === endpoint.transactionLabel ||
            row.txn.tcode === endpoint.transactionLabel
        )?.selectedTransactionId ||
        'NULL';
      const typeCode = this.toEndpointTypeCode(endpoint.endpointType);
      const pathId = typeCode === 'O' ? 9 : 8;

      return `\t(${endpointId}, ${customerIntId}, ${companyRowId}, NULL, NULL, ${this.sqlString(endpoint.transactionLabel)}, ${this.sqlString(typeCode)}, ${this.sqlString(endpoint.endpointUrl)}, ${this.sqlString(endpoint.assetcuesEndpoint)}, ${pathId}, ${this.sqlNullableString(endpoint.payload || null)}, NULL, ${this.sqlString(endpoint.authentication || 'None')}, NULL, NULL, NULL, NULL, NULL, ${selectedTxnId}, ${this.sqlNumber(customerId)}, ${this.sqlString(tenantId)}, 1, now(), 1, now(), '~', '"', '.csv', ${integrationTypeId})`;
    });

    return `
INSERT INTO integration.in_customerendpoints(endpointid, customerintid, customerintcompanyid, moduleid, moduletransactionid, endpointcode, endpointtype, endpoint, assetcuesendpoint, pathid, payload, description, authenticationtype, authheaderformat, apikey, clientsecret, assetcuesapikey, assetcuesclientsecret, selectedtransactionid, customerid, tenantid, createdby, creationdate, updatedby, updatedate, delimeter, qualifier, fileextension, integrationtypeid) VALUES
${rows.join(',\n')};
`.trim();
  }

  private buildScheduler(
    scheduler: NonNullable<OnboardingModel['scheduler']>,
    scheduleBaseId: number,
    integrationTypeId: number,
    customerId: string,
    tenantId: string
  ): string {
    const mask = this.daysToBitmask(scheduler.selectedDays);
    const frequency = this.sqlNumber(scheduler.frequency || '1640');
    const types = ['M', 'I', 'O'];
    const frequencyRows = types.map((type, index) => {
      const id = scheduleBaseId + index;
      return `\t(${id}, ${this.sqlString(type)}, ${integrationTypeId}, ${frequency}, ${this.sqlString(scheduler.startTime || '8:00:00')}, ${this.sqlString(scheduler.endTime || '6:00:00')}, ${mask}, null, null, null, ${this.sqlString(scheduler.parameters || '{}')}, ${this.sqlNumber(customerId)}, ${this.sqlString(tenantId)}, 1, now(), 1, now())`;
    });

    const instanceRows = types.map((_, index) => {
      const id = scheduleBaseId + index;
      return `\t(${id}, ${id}, 'S', null, null, null, ${this.sqlNumber(customerId)}, ${this.sqlString(tenantId)}, 1, now(), 1, now())`;
    });

    return `
INSERT INTO integration.in_schedulefrequency (schedulefrequencyid, endpointtype, integrationtypeid, frequency, starttime, endtime, selecteddays, lastrundate, nextrundate, lastenddateparam, param, customerid, tenantid, createdby, creationdate, updatedby, updatedate) VALUES
${frequencyRows.join(',\n')};
${this.separator()}
INSERT INTO integration.in_scheduleinstances (scheduleinstanceid, schedulefrequencyid, status, fromdateparam, enddateparam, param, customerid, tenantid, createdby, creationdate, updatedby, updatedate) VALUES
${instanceRows.join(',\n')};
`.trim();
  }

  private buildCustomerFields(
    fields: NonNullable<OnboardingModel['customerFields']>['fields'],
    fieldBaseId: number,
    customerIntId: number,
    companyRowId: number,
    customerId: string,
    tenantId: string
  ): string {
    const rows = fields.map((field, index) => {
      const id = fieldBaseId + index + 1;
      const applicable = this.toApplicableCode(field.applicableFor);
      const appFieldId = this.sqlNumber(field.applicationFieldId || String(index + 1));
      return `\t(${id}, ${customerIntId}, ${companyRowId}, ${appFieldId}, ${this.sqlString(applicable)}, ${this.sqlNullableBool(field.forEdit)}, ${this.sqlNullableBool(field.forTagging)}, ${this.sqlNullableBool(field.forAudit)}, ${this.sqlNullableBool(field.forTransfer)}, ${this.sqlNullableBool(field.forRetire)}, ${this.sqlNullableBool(field.forAllocation)}, ${this.sqlNullableBool(field.forSplit)}, ${this.sqlNumber(customerId)}, ${this.sqlString(tenantId)}, 1, now(), 1, now(), NULL)`;
    });

    return `
ALTER TABLE integration.in_customerfields DROP CONSTRAINT IF EXISTS in_customerfields_customerintid_applicationfieldid_key;

INSERT INTO integration.in_customerfields (customerfieldid, customerintid, customerintcompanyid, applicationfieldid, applicablefor, foredit, fortagging, foraudit, fortransfer, forretire, forallocation, forsplit, customerid, tenantid, createdby, creationdate, updatedby, updatedate, selectedtransactionid) VALUES
${rows.join(',\n')};
`.trim();
  }

  private buildFieldMappings(
    mappings: NonNullable<OnboardingModel['fieldMapping']>['mappings'],
    mappingBaseId: number,
    endpoints: NonNullable<OnboardingModel['endpoints']>['endpoints'],
    fields: NonNullable<OnboardingModel['customerFields']>['fields'],
    fieldBaseId: number,
    endpointBaseId: number,
    txnRows: Array<{ selectedTransactionId: number }>,
    customerIntId: number,
    companyRowId: number,
    customerId: string,
    tenantId: string
  ): string {
    const rows = mappings.map((mapping, index) => {
      const id = mappingBaseId + index + 1;
      const endpointId = endpointBaseId + 1;
      const customerFieldId = fieldBaseId + 1;
      const selectedTxnId = txnRows[0]?.selectedTransactionId ?? 'NULL';
      return `\t(${id}, ${endpointId}, ${customerFieldId}, ${companyRowId}, ${this.sqlString(mapping.customerField)}, NULL, ${this.sqlString(mapping.dbColumn || mapping.standardField)}, ${customerIntId}, ${this.sqlNumber(customerId)}, ${this.sqlString(tenantId)}, ${mapping.sequence || index + 1}, 1, now(), 1, now(), ${selectedTxnId})`;
    });

    // silence unused if empty endpoints/fields
    void endpoints;
    void fields;

    return `
INSERT INTO integration.in_customerfieldmapping (fieldmappingid, endpointid, customerfieldid, customerintcompanyid, fieldcode, standardfieldid, dbcolumn, customerintid, customerid, tenantid, sequence, createdby, creationdate, updatedby, updatedate, selectedtransactionid) VALUES
${rows.join(',\n')};
`.trim();
  }

  private separator(): string {
    return '\n------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------\n';
  }

  private toStableId(customerId: string, fallback: number): number {
    const numeric = Number(customerId);
    if (!Number.isNaN(numeric) && numeric > 0) {
      return numeric;
    }
    return fallback;
  }

  private toEndpointTypeCode(label: string): string {
    const value = (label || '').toLowerCase();
    if (value.startsWith('o')) return 'O';
    if (value.startsWith('m')) return 'M';
    return 'I';
  }

  private toApplicableCode(label: string): string {
    const value = (label || '').toLowerCase();
    if (value.startsWith('o')) return 'O';
    if (value.startsWith('i')) return 'I';
    return 'B';
  }

  private daysToBitmask(days: boolean[]): number {
    return days.reduce((mask, selected, index) => (selected ? mask | (1 << index) : mask), 0);
  }

  private sqlString(value: string): string {
    return `'${String(value ?? '').replace(/'/g, "''")}'`;
  }

  private sqlNullableString(value: string | null | undefined): string {
    if (value === null || value === undefined || value === '') {
      return 'null';
    }
    return this.sqlString(value);
  }

  private sqlNumber(value: string | number): string {
    const numeric = Number(value);
    return Number.isNaN(numeric) ? '0' : String(numeric);
  }

  private sqlNullableNumber(value: number | null | undefined): string {
    if (value === null || value === undefined) {
      return 'null';
    }
    return String(value);
  }

  private sqlNullableBool(value: boolean): string {
    return value ? 'true' : 'null';
  }
}
