export interface SignatureResponse {
  payload: string;
  signature: string;
}

export interface QRResponse {
  referenceNo: string;
  qrContent: string;
}

export interface Transaction {
  id: string;
  merchant_id: string;
  amount: number;
  trx_id: string;
  partner_reference_no?: string;
  reference_no?: string;
  status?: string;
  transaction_date?: string;
  paid_date?:
    | {
        String?: string;
        Valid?: boolean;
      }
    | string;
}

export interface ApiResponse {
  data: Transaction[];
  meta: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface PaymentResponse {
  responseMessage: string;
  responseCode?: string;
}
