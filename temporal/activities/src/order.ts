export async function createStripeCustomer(email: string) {
  if (email == "existing@test.com") {
    throw new Error("Customer already exists");
  }
  return {
    id: "cus_123",
    email,
  };
}

export async function createStripeCheckoutSession(
  amount: number,
  customerId: string,
) {
  return {
    id: "session_123",
    customerId,
    amount: amount,
    url: "https://test.com",
    status: "pending",
  };
}

export async function getStripePaymentStatus(sessionId: string) {
  return {
    id: sessionId,
    status: "paid",
  };
}

export async function updateOrderStatus(orderId: string, status: string) {
  return {
    id: orderId,
    status,
  };
}
