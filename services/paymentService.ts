
import { PaymentEscrowStatus } from '../types';

/**
 * Frontend service to interact with Razorpay Escrow API
 * In a real app, these would be fetch/axios calls to your Node.js backend
 */
export const paymentService = {
  /**
   * Called when a Shipper accepts a quote and pays.
   * Creates an order with a transfer that is 'on_hold'.
   */
  async createEscrowPayment(orderId: string, amount: number, carrierAccountId: string) {
    console.log(`[Escrow] Creating payment for ${orderId} to account ${carrierAccountId}`);
    // Simulate API delay
    await new Promise(r => setTimeout(r, 1000));
    return {
      razorpayOrderId: `order_${Math.random().toString(36).substr(2, 9)}`,
      razorpayTransferId: `trf_${Math.random().toString(36).substr(2, 9)}`,
      status: 'SECURED' as PaymentEscrowStatus
    };
  },

  /**
   * Called when PoD is verified.
   * Releases the hold on the transfer.
   */
  async releasePayment(transferId: string) {
    console.log(`[Escrow] Releasing funds for transfer ${transferId}`);
    // Simulate API call to PATCH /v1/transfers/{transferId} { "on_hold": false }
    await new Promise(r => setTimeout(r, 1500));
    return { success: true, status: 'RELEASED' as PaymentEscrowStatus };
  },

  /**
   * Get current payment status for an order
   */
  async getPaymentStatus(orderId: string): Promise<PaymentEscrowStatus> {
    // In a real app, fetch from DB
    return 'SECURED';
  }
};
