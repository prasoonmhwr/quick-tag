import { Polar } from "@polar-sh/sdk";

console.log(process.env.POLAR_PRODUCT_ID,process.env.POLAR_ACCESS_TOKEN)
const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  server: process.env.NODE_ENV === "production" ? "production" : "sandbox",
});

export async function createCheckoutSessionForUser(userId: string) {
  const session = await polar.checkouts.create({
    products: [`${process.env.POLAR_PRODUCT_ID}`],        // required product(s)
    externalCustomerId: userId, 
    metadata: { userId },      // ties the session to your user
    // Optional: return URL with placeholder
    successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/billing/success?checkout_id={CHECKOUT_ID}`,
  });
  return session.url;
}

export async function cancelSubscription(subscriptionId: string) {
  const deleted = await polar.subscriptions.update({
    id: subscriptionId,
    subscriptionUpdate: { cancelAtPeriodEnd: true } 
  });
  return deleted;
}