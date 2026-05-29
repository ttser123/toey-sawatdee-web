// demo-workspace/services/stripe-client.ts
export const createPaymentIntent = (amount: number) => {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  console.log(`Initializing Stripe with Key: ${apiKey?.substring(0, 5)}...`);
  return { amount, webhookSecret };
};
