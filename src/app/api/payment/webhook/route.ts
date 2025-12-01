import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Webhook signature verification failed" },
        { status: 400 }
      );
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCanceled(subscription);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const plan = session.metadata?.plan as "premium" | "premium_plus";

  if (!userId || !plan) {
    console.error("Missing userId or plan in session metadata");
    return;
  }

  const stripe = getStripe();
  const subscriptionId = session.subscription as string;
  const subscriptionResponse = await stripe.subscriptions.retrieve(subscriptionId);
  const subscription = subscriptionResponse as unknown as { status: string; currentPeriodEnd: number };

  await prisma.user.update({
    where: { id: userId },
    data: {
      plan,
      stripeSubscriptionId: subscriptionId,
      subscriptionStatus: subscription.status,
      currentPeriodEnd: new Date(subscription.currentPeriodEnd * 1000),
    },
  });

  console.log(`User ${userId} subscribed to ${plan}`);
}

async function handleSubscriptionUpdate(subscriptionData: Stripe.Subscription) {
  const subscription = subscriptionData as unknown as {
    id: string;
    status: string;
    currentPeriodEnd: number;
    metadata?: { userId?: string };
  };
  const userId = subscription.metadata?.userId;

  if (!userId) {
    // stripeSubscriptionId로 사용자 찾기
    const user = await prisma.user.findFirst({
      where: { stripeSubscriptionId: subscription.id },
    });

    if (!user) {
      console.error("User not found for subscription:", subscription.id);
      return;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionStatus: subscription.status,
        currentPeriodEnd: new Date(subscription.currentPeriodEnd * 1000),
      },
    });
  } else {
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionStatus: subscription.status,
        currentPeriodEnd: new Date(subscription.currentPeriodEnd * 1000),
      },
    });
  }
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  const user = await prisma.user.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (!user) {
    console.error("User not found for canceled subscription:", subscription.id);
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      plan: "free",
      subscriptionStatus: "canceled",
      stripeSubscriptionId: null,
    },
  });

  console.log(`Subscription canceled for user ${user.id}`);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log(`Payment succeeded for invoice: ${invoice.id}`);
}

async function handlePaymentFailed(invoiceData: Stripe.Invoice) {
  const invoice = invoiceData as unknown as { subscription?: string };
  const subscriptionId = invoice.subscription;

  if (subscriptionId) {
    const user = await prisma.user.findFirst({
      where: { stripeSubscriptionId: subscriptionId },
    });

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          subscriptionStatus: "past_due",
        },
      });

      console.log(`Payment failed for user ${user.id}`);
    }
  }
}
