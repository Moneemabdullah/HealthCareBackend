import Stripe from "stripe";
import { prisma } from "../../lib/prisma";
import { PaymentStatus } from "../../../generated/prisma/enums";

const handleStripeWebhookEvent = async (event: Stripe.Event) => {
    const existingEvent = await prisma.payment.findFirst({
        where: { stripeEventId: event.id },
    });

    if (existingEvent) {
        console.log(`Event with ID ${event.id} already processed. Skipping.`);
        return {
            message: `Event with ID ${event.id} already processed. Skipping.`,
        };
    }

    switch (event.type) {
        case "checkout.session.completed":
            // Handle completed checkout session
            {
                const session = event.data.object as Stripe.Checkout.Session;

                const appointmentId = session.metadata?.appointmentId;
                const paymentId = session.metadata?.paymentId;

                if (!paymentId || !appointmentId) {
                    return {
                        message:
                            "Missing paymentId or appointmentId in session metadata",
                    };
                }

                const appointment = await prisma.appointment.findUnique({
                    where: { id: appointmentId },
                });

                if (!appointment) {
                    return {
                        message: `Appointment with ID ${appointmentId} not found`,
                    };
                }

                await prisma.$transaction(async (tx) => {
                    await tx.appointment.update({
                        where: {
                            id: appointmentId,
                        },
                        data: {
                            paymentStatus:
                                (session.payment_status as PaymentStatus) ===
                                "PAID"
                                    ? PaymentStatus.PAID
                                    : PaymentStatus.UNPAID,
                        },
                    });

                    await tx.payment.update({
                        where: {
                            id: paymentId,
                        },
                        data: {
                            stripeEventId: event.id,
                            status: session.payment_status as PaymentStatus,
                            paymentGatewayData: session as any,
                        },
                    });
                });

                console.log(`payment checkout session completed`);
            }
            break;
        case "checkout.session.expired":
            // Handle expired checkout session
            {
                const session = event.data.object as Stripe.Checkout.Session;
                console.log(`payment checkout session expired`);
            }
            break;
        case "payment_intent.payment_failed":
            // Handle failed payment intent
            {
                const session = event.data.object as Stripe.PaymentIntent;
                console.log(`payment intent failed`);
            }
            break;

        default:
            console.log(`Unhandled event type ${event.type}`);
            break;
    }

    return { message: "Event processed successfully" };
};

export const PaymentService = {
    handleStripeWebhookEvent,
};
