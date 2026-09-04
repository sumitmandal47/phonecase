"use server";

import { db } from "@/db";
import { stripe } from "@/lib/stripe";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import Stripe from "stripe";

type SessionWithShipping = Stripe.Checkout.Session & {
  shipping_details?: {
    address?: Stripe.Address | null;
    name?: string | null;
  } | null;
};

export const getPaymentStatus = async ({ orderId }: { orderId: string }) => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user?.id || !user.email) {
    throw new Error("You need to be logged in to view this page.");
  }

  let order = await db.order.findFirst({
    where: {
      id: orderId,
      user: {
        email: user.email,
      },
    },
    include: {
      billingAddress: true,
      configuration: true,
      shippingAddress: true,
      user: true,
    },
  });

  if (!order) {
    // Check by ID as fallback
    order = await db.order.findFirst({
      where: { id: orderId },
      include: {
        billingAddress: true,
        configuration: true,
        shippingAddress: true,
        user: true,
      },
    });
  }

  if (!order) throw new Error("This order does not exist.");

  if (order.isPaid) {
    return order;
  }

  // If order is not yet marked paid (e.g. webhook delayed or local development),
  // verify payment status directly with Stripe API
  try {
    const sessions = await stripe.checkout.sessions.list({
      limit: 20,
    });

    const matchingSession = sessions.data.find(
      (s) => s.metadata?.orderId === orderId && s.payment_status === "paid"
    ) as SessionWithShipping | undefined;

    if (matchingSession) {
      const billing = matchingSession.customer_details?.address;
      const shipping = matchingSession.shipping_details?.address;

      const updatedOrder = await db.order.update({
        where: { id: orderId },
        data: {
          isPaid: true,
          billingAddress: billing
            ? {
                create: {
                  name: matchingSession.customer_details?.name ?? "",
                  city: billing.city ?? "",
                  country: billing.country ?? "",
                  postalCode: billing.postal_code ?? "",
                  street: billing.line1 ?? "",
                  state: billing.state ?? "",
                },
              }
            : undefined,
          shippingAddress: shipping
            ? {
                create: {
                  name: matchingSession.customer_details?.name ?? "",
                  city: shipping.city ?? "",
                  country: shipping.country ?? "",
                  postalCode: shipping.postal_code ?? "",
                  street: shipping.line1 ?? "",
                  state: shipping.state ?? "",
                },
              }
            : undefined,
        },
        include: {
          billingAddress: true,
          configuration: true,
          shippingAddress: true,
          user: true,
        },
      });

      return updatedOrder;
    }
  } catch (err) {
    console.error("Stripe verification check error:", err);
  }

  return false;
};

