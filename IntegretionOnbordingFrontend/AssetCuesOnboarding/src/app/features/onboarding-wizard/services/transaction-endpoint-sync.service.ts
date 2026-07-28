import { Injectable } from '@angular/core';
import {
  EndpointItemModel,
  EndpointsStepModel,
  createEmptyEndpointItem,
} from '../steps/endpoints/endpoints.model';
import {
  TransactionItemModel,
  TransactionsStepModel,
} from '../steps/transactions/transactions.model';
import { OnboardingModel } from '../models/onboarding-model';

/**
 * Parent-child synchronizer: Transactions (source of truth) → Endpoints.
 * UI components stay lightweight; all sync rules live here.
 * Designed so future POST/PUT/DELETE APIs can wrap these methods without UI changes.
 */
@Injectable({ providedIn: 'root' })
export class TransactionEndpointSyncService {
  /**
   * Rebuilds the Endpoint collection from enabled Transactions.
   * Preserves editable fields for endpoints that still match an enabled transaction.
   * Removes orphans. Creates defaults for newly enabled transactions.
   */
  synchronize(
    transactions: readonly TransactionItemModel[],
    existingEndpoints: readonly EndpointItemModel[] = []
  ): EndpointItemModel[] {
    const enabled = transactions.filter((txn) => txn.enabled);
    const result: EndpointItemModel[] = [];

    for (const txn of enabled) {
      const key = this.buildTransactionKey(txn);
      const existing = this.findMatchingEndpoint(existingEndpoints, txn, key);

      if (existing) {
        result.push(this.refreshLinkedFields(existing, txn, key));
      } else {
        result.push(this.createDefaultEndpoint(txn, key));
      }
    }

    return result;
  }

  synchronizeStep(
    transactions: TransactionsStepModel | null | undefined,
    endpoints: EndpointsStepModel | null | undefined
  ): EndpointsStepModel {
    return {
      endpoints: this.synchronize(
        transactions?.transactions ?? [],
        endpoints?.endpoints ?? []
      ),
    };
  }

  /**
   * Ensures model consistency after import / resume.
   * Endpoints always mirror enabled Transactions; orphan endpoints are dropped.
   */
  ensureConsistent(model: OnboardingModel): OnboardingModel {
    const transactions = model.transactions?.transactions ?? [];
    if (transactions.length === 0) {
      return {
        ...model,
        endpoints: { endpoints: [] },
      };
    }

    return {
      ...model,
      endpoints: this.synchronizeStep(model.transactions, model.endpoints),
    };
  }

  createDefaultEndpoint(
    transaction: TransactionItemModel,
    key = this.buildTransactionKey(transaction)
  ): EndpointItemModel {
    const now = new Date().toISOString();
    const blank = createEmptyEndpointItem();

    return {
      ...blank,
      transactionLabel: transaction.transactionName || transaction.tcode || 'Transaction',
      selectedTransactionId: key,
      transactionCode: transaction.tcode || '',
      endpointType: transaction.endpointType || 'Inbound',
      endpointUrl: '',
      assetcuesEndpoint: this.defaultAssetCuesPath(transaction),
      authentication: 'None',
      payload: '{}',
      status: 'Enabled',
      timeout: 30,
      retryCount: 3,
      headers: '{}',
      createdDate: now,
      updatedDate: now,
    };
  }

  hasEnabledTransaction(transactions: readonly TransactionItemModel[]): boolean {
    return transactions.some((txn) => txn.enabled);
  }

  validateConsistency(
    transactions: readonly TransactionItemModel[],
    endpoints: readonly EndpointItemModel[]
  ): readonly string[] {
    const issues: string[] = [];
    const enabledKeys = new Set(
      transactions.filter((txn) => txn.enabled).map((txn) => this.buildTransactionKey(txn))
    );
    const endpointKeys = new Set(endpoints.map((endpoint) => endpoint.selectedTransactionId));

    for (const key of enabledKeys) {
      if (!endpointKeys.has(key)) {
        issues.push(`Missing endpoint for enabled transaction "${key}".`);
      }
    }

    for (const endpoint of endpoints) {
      if (!enabledKeys.has(endpoint.selectedTransactionId)) {
        const alsoMatched = transactions.some(
          (txn) =>
            txn.enabled &&
            (txn.tcode === endpoint.transactionCode ||
              txn.transactionName === endpoint.transactionLabel)
        );
        if (!alsoMatched) {
          issues.push(
            `Orphan endpoint "${endpoint.transactionLabel}" is not linked to an enabled transaction.`
          );
        }
      }
    }

    const seen = new Set<string>();
    for (const endpoint of endpoints) {
      const key = endpoint.selectedTransactionId || endpoint.transactionCode;
      if (seen.has(key)) {
        issues.push(`Duplicate endpoint for "${key}".`);
      }
      seen.add(key);
    }

    return issues;
  }

  buildTransactionKey(transaction: TransactionItemModel): string {
    const typeId = transaction.transactionTypeId ?? 'x';
    const code = (transaction.tcode || transaction.transactionName || 'unknown').trim();
    return `${typeId}::${code}`;
  }

  private findMatchingEndpoint(
    existing: readonly EndpointItemModel[],
    txn: TransactionItemModel,
    key: string
  ): EndpointItemModel | undefined {
    return existing.find(
      (endpoint) =>
        endpoint.selectedTransactionId === key ||
        (!!txn.tcode &&
          (endpoint.transactionCode === txn.tcode ||
            endpoint.selectedTransactionId === txn.tcode ||
            endpoint.transactionLabel === txn.tcode)) ||
        (!!txn.transactionName && endpoint.transactionLabel === txn.transactionName)
    );
  }

  private refreshLinkedFields(
    existing: EndpointItemModel,
    txn: TransactionItemModel,
    key: string
  ): EndpointItemModel {
    return {
      ...existing,
      transactionLabel: txn.transactionName || existing.transactionLabel,
      transactionCode: txn.tcode || existing.transactionCode,
      selectedTransactionId: key,
      endpointType: txn.endpointType || existing.endpointType,
      status: 'Enabled',
      timeout: existing.timeout ?? 30,
      retryCount: existing.retryCount ?? 3,
      headers: existing.headers || '{}',
      createdDate: existing.createdDate || new Date().toISOString(),
      updatedDate: existing.updatedDate || new Date().toISOString(),
    };
  }

  private defaultAssetCuesPath(transaction: TransactionItemModel): string {
    const slug = (transaction.tcode || transaction.transactionName || 'endpoint')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    return `/api/integration/${slug}`;
  }
}
