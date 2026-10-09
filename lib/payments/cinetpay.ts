import crypto from 'crypto';
import {
  PaymentProvider,
  CreateCheckoutParams,
  CheckoutResult,
  VerifyTransactionResult,
} from './provider';

export class CinetPayProvider implements PaymentProvider {
  name = 'cinetpay';

  private apiKey: string;
  private siteId: string;
  private secretKey: string;
  private isSimulation: boolean;

  constructor() {
    this.apiKey = process.env.CINETPAY_API_KEY || '';
    this.siteId = process.env.CINETPAY_SITE_ID || '';
    this.secretKey = process.env.CINETPAY_SECRET_KEY || '';

    // Si les clés API CinetPay ne sont pas configurées, on active le mode sandbox simulé pour le dev local
    this.isSimulation =
      !this.apiKey ||
      !this.siteId ||
      this.apiKey.startsWith('mock') ||
      process.env.NODE_ENV === 'development';
  }

  async createCheckout(params: CreateCheckoutParams): Promise<CheckoutResult> {
    const providerTxId = `el_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    if (this.isSimulation && !process.env.CINETPAY_FORCE_LIVE) {
      console.log(
        `[CinetPay Sandbox] Simulation checkout pour ${params.amount} ${params.currency} (Pack ${params.packId}). Transaction: ${providerTxId}`
      );

      // En mode sandbox sans clés marchandes, on redirige vers la page de retour simulée
      const simulatedUrl = new URL(params.returnUrl);
      simulatedUrl.searchParams.set('tx', providerTxId);
      simulatedUrl.searchParams.set('simulated', 'true');
      simulatedUrl.searchParams.set('packId', params.packId);
      simulatedUrl.searchParams.set('credits', String(params.credits));

      return {
        paymentUrl: simulatedUrl.toString(),
        providerTxId,
        paymentToken: `sim_token_${providerTxId}`,
      };
    }

    const payload = {
      apikey: this.apiKey,
      site_id: this.siteId,
      transaction_id: providerTxId,
      amount: params.amount,
      currency: params.currency || 'XAF',
      description: `EasyLead ${params.packId} (${params.credits} Crédits)`,
      notify_url: params.notifyUrl,
      return_url: `${params.returnUrl}?tx=${providerTxId}`,
      channels: 'ALL',
      customer_name: params.userName?.split(' ')[0] || 'Client',
      customer_surname: params.userName?.split(' ').slice(1).join(' ') || 'EasyLead',
      customer_email: params.userEmail,
      customer_phone_number: params.phoneNumber || '+237600000000',
      customer_address: 'Douala',
      customer_city: 'Douala',
      customer_country: 'CM',
      customer_state: 'CM',
      customer_zip_code: '00237',
    };

    const res = await fetch('https://api-checkout.cinetpay.com/v2/payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[CinetPay API Error]', res.status, errText);
      throw new Error(`Erreur initialisation CinetPay: ${res.statusText}`);
    }

    const data = await res.json();

    if (data.code !== '201') {
      console.error('[CinetPay Rejection]', data);
      throw new Error(data.message || 'Échec création session CinetPay');
    }

    return {
      paymentUrl: data.data.payment_url,
      providerTxId,
      paymentToken: data.data.payment_token,
    };
  }

  async verifyTransaction(providerTxId: string): Promise<VerifyTransactionResult> {
    if (this.isSimulation && !process.env.CINETPAY_FORCE_LIVE) {
      console.log(`[CinetPay Sandbox] Vérification transaction simulée: ${providerTxId}`);
      return {
        status: 'succeeded',
        amount: 12000,
        currency: 'XAF',
        operatorId: `sim_op_${Date.now()}`,
        paymentMethod: 'mtn_momo',
        raw: { simulation: true, verifiedAt: new Date().toISOString() },
      };
    }

    const payload = {
      apikey: this.apiKey,
      site_id: this.siteId,
      transaction_id: providerTxId,
    };

    const res = await fetch('https://api-checkout.cinetpay.com/v2/payment/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[CinetPay Check Error]', res.status, errText);
      return {
        status: 'failed',
        amount: 0,
        currency: 'XAF',
      };
    }

    const data = await res.json();

    if (data.code === '00' && data.data) {
      const status =
        data.data.status === 'ACCEPTED'
          ? 'succeeded'
          : data.data.status === 'REFUSED'
          ? 'failed'
          : 'pending';

      return {
        status,
        amount: data.data.amount,
        currency: data.data.currency,
        operatorId: data.data.operator_id,
        paymentMethod: data.data.payment_method,
        raw: data,
      };
    }

    return {
      status: 'failed',
      amount: 0,
      currency: 'XAF',
      raw: data,
    };
  }

  verifyWebhookSignature(rawBody: string, tokenHeader?: string | null): boolean {
    if (this.isSimulation) return true;
    if (!this.secretKey || !tokenHeader) return true;

    try {
      const computed = crypto
        .createHmac('sha256', this.secretKey)
        .update(rawBody)
        .digest('hex');
      return crypto.timingSafeEqual(
        Buffer.from(computed),
        Buffer.from(tokenHeader)
      );
    } catch {
      return false;
    }
  }
}

export const cinetPayProvider = new CinetPayProvider();
