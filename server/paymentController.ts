
/**
 * Razorpay Route Controller (Node.js/Express)
 * 
 * Necessary Environment Variables:
 * RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXX
 * RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXXX
 */

/* 
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const paymentController = {
*/

  /**
   * STEP 1: Create Order with Transfer on Hold
   * This is called by the Shipper when they accept a quote.
   */
  /*
  createOrder: async (req, res) => {
    try {
      const { amount, carrierAccountId, orderId } = req.body;

      const options = {
        amount: amount * 100, // in paise
        currency: "INR",
        receipt: `receipt_${orderId}`,
        transfers: [
          {
            account: carrierAccountId,
            amount: amount * 100,
            currency: "INR",
            on_hold: true, // IMPORTANT: Funds are captured but held
            on_hold_until: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // Hold for up to 7 days
          }
        ]
      };

      const order = await razorpay.orders.create(options);
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  */

  /**
   * STEP 2: Release Settlement Hold
   * This is called by the system once PoD is verified.
   */
  /*
  releasePayment: async (req, res) => {
    try {
      const { transferId } = req.params;

      // PATCH /v1/transfers/{id}
      // Note: In older SDKs you might need to use raw fetch or a specific method
      const transfer = await razorpay.transfers.edit(transferId, {
        on_hold: false
      });

      res.json({ status: 'RELEASED', transfer });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};
*/

// For reference: 
// The PoD upload endpoint structure:
// POST /api/orders/:orderId/verify-pod
// Payload: { photo: base64, signature: base64, gps: { lat, lng } }
