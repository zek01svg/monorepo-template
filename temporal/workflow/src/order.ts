import {
  condition,
  defineSignal,
  proxyActivities,
  setHandler,
} from "@temporalio/workflow";

import type * as activities from "@repo/temporal-activities";

interface Order {
  id: string;
  amount: number;
  email: string;
}

const PAYMENT_TIMEOUT = "5m";
const ACTIVITY_TIMEOUT = "1m";
const ACTIVITY_RETRY_MAX_INTERVAL = "1m";

const paymentSucceededSignal = defineSignal<[string]>("paymentSucceeded");

const paymentFailedSignal = defineSignal<[string]>("paymentFailed");

const {
  createStripeCustomer,
  createStripeCheckoutSession,
  getStripePaymentStatus,
  updateOrderStatus,
} = proxyActivities<typeof activities>({
  startToCloseTimeout: ACTIVITY_TIMEOUT,
  retry: {
    maximumInterval: ACTIVITY_RETRY_MAX_INTERVAL,
  },
});

export async function order(order: Order) {
  let paymentStatus: string;

  const customer = await createStripeCustomer(order.email);

  const session = await createStripeCheckoutSession(order.amount, customer.id);

  paymentStatus = session.status;

  const isPaymentSuccessful = await condition(
    () => paymentStatus === "complete",
    PAYMENT_TIMEOUT,
  );

  const stripePaymentStatus = await getStripePaymentStatus(session.id);

  setHandler(paymentSucceededSignal, () => {
    paymentStatus = "complete";
  });

  setHandler(paymentFailedSignal, () => {
    paymentStatus = "failed";
  });

  if (isPaymentSuccessful) {
    await updateOrderStatus(order.id, stripePaymentStatus.status);
  }
}
