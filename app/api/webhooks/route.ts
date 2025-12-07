

// import { db } from "@/db";
// import { stripe } from "@/lib/stripe";
// import { headers } from "next/headers";
// import { NextResponse } from "next/server";
// import Stripe from "stripe";

// // Extend the Stripe session type to include shipping_details
// type SessionWithShipping = Stripe.Checkout.Session & {
//   shipping_details?: {
//     address?: Stripe.Address | null;
//     name?: string | null;
//   } | null;
// };

// export async function POST(req: Request) {
//   try {
//     const body = await req.text();
//     const signature = (await headers()).get("stripe-signature");

//     if (!signature) {
//       return new Response("Invalid signature", { status: 400 });
//     }

//     const event = stripe.webhooks.constructEvent(
//       body,
//       signature,
//       process.env.STRIPE_WEBHOOK_SECRET!
//     );

//     if (event.type === "checkout.session.completed") {
//       const session = event.data.object as SessionWithShipping;

//       if (!session.customer_details?.email) {
//         throw new Error("Missing user email");
//       }

//       const { userId, orderId } = session.metadata || {};
//       if (!userId || !orderId) {
//         throw new Error("Invalid request metadata");
//       }

//       const billingAddress = session.customer_details?.address;
//       if (!billingAddress) throw new Error("Billing address missing");

//       const shippingAddress = session.shipping_details?.address;
//       if (!shippingAddress) {
//         console.warn(
//           "⚠️ Shipping address missing (digital product or user skipped shipping)"
//         );
//       }

//       await db.order.update({
//         where: { id: orderId },
//         data: {
//           isPaid: true,

//           billingAddress: {
//             create: {
//               name: session.customer_details?.name ?? "",
//               city: billingAddress.city ?? "",
//               country: billingAddress.country ?? "",
//               postalCode: billingAddress.postal_code ?? "",
//               street: billingAddress.line1 ?? "",
//               state: billingAddress.state ?? "",
//             },
//           },

//           shippingAddress: shippingAddress
//             ? {
//                 create: {
//                   name: session.customer_details?.name ?? "",
//                   city: shippingAddress.city ?? "",
//                   country: shippingAddress.country ?? "",
//                   postalCode: shippingAddress.postal_code ?? "",
//                   street: shippingAddress.line1 ?? "",
//                   state: shippingAddress.state ?? "",
//                 },
//               }
//             : undefined,
//         },
//       });
//     }

//     return NextResponse.json({ result: event, ok: true });
//   } catch (err) {
//     console.error("❌ WEBHOOK ERROR:", err);
//     return NextResponse.json(
//       { message: "Something went wrong", ok: false },
//       { status: 500 }
//     );
//   }
// }

import { db } from "@/db";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

// Extend Checkout Session type (Stripe typings missing shipping_details)
type SessionWithShipping = Stripe.Checkout.Session & {
  shipping_details?: {
    address?: Stripe.Address | null;
    name?: string | null;
  } | null;
};

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = (await headers()).get("stripe-signature");

    if (!signature) {
      return new Response("Invalid signature", { status: 400 });
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as SessionWithShipping;

      if (!session.customer_details?.email) {
        throw new Error("Missing user email");
      }

      const { userId, orderId } = session.metadata || {};
      if (!userId || !orderId) {
        throw new Error("Invalid request metadata");
      }

      // Billing Address
      const billing = session.customer_details.address;
      if (!billing) throw new Error("Missing billing address");

      // Shipping Address (can be null)
      const shipping = session.shipping_details?.address;

      await db.order.update({
        where: { id: orderId },
        data: {
          isPaid: true,

          billingAddress: {
            create: {
              name: session.customer_details.name ?? "",
              city: billing.city ?? "",
              country: billing.country ?? "",
              postalCode: billing.postal_code ?? "",
              street: billing.line1 ?? "",
              state: billing.state ?? "",
            },
          },

          shippingAddress: shipping
            ? {
                create: {
                  name: session.customer_details.name ?? "",
                  city: shipping.city ?? "",
                  country: shipping.country ?? "",
                  postalCode: shipping.postal_code ?? "",
                  street: shipping.line1 ?? "",
                  state: shipping.state ?? "",
                },
              }
            : undefined,
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("❌ WEBHOOK ERROR:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
