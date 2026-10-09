export interface CreateCheckoutParams {
  userId: string;
  userEmail: string;
  userName?: string;
  packId: string;
  credits: number;
  amount: number;
  currency: string;
  phoneNumber?: string;
  paymentMethod?: string;
  notifyUrl: string;
  returnUrl: string;
}

export interface CheckoutResult {
  paymentUrl: string;
  providerTxId: string;
  paymentToken?: string;
}

export interface VerifyTransactionResult {
  status: 'succeeded' | 'failed' | 'pending';
  amount: number;
  currency: string;
  operatorId?: string;
  paymentMethod?: string;
  raw?: unknown;
}

export interface PaymentProvider {
  name: string;
  createCheckout(params: CreateCheckoutParams): Promise<CheckoutResult>;
  verifyTransaction(providerTxId: string): Promise<VerifyTransactionResult>;
}
