export interface EndpointItemModel {
  /** Display name sourced from the parent Transaction */
  transactionLabel: string;
  /** Stable link key to the parent Transaction (typeId::tcode) */
  selectedTransactionId: string;
  /** Transaction code (tcode) mirrored from parent */
  transactionCode: string;
  endpointType: 'Inbound' | 'Outbound' | 'Master' | string;
  endpointUrl: string;
  assetcuesEndpoint: string;
  authentication: string;
  payload: string;
  status: 'Enabled' | 'Disabled';
  timeout: number | null;
  retryCount: number | null;
  /** JSON string of HTTP headers */
  headers: string;
  createdDate: string;
  updatedDate: string;
}

export interface EndpointsStepModel {
  endpoints: EndpointItemModel[];
}

export function createEmptyEndpointItem(): EndpointItemModel {
  const now = new Date().toISOString();
  return {
    transactionLabel: '',
    selectedTransactionId: '',
    transactionCode: '',
    endpointType: 'Inbound',
    endpointUrl: '',
    assetcuesEndpoint: '',
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
