import { NextFunction, Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { envVars } from "../../config/env";
import status from "http-status";
import { stripe } from "../../config/stripe.config";
import { PaymentService } from "./payment.service";
import { sendResponse } from "../../shared/sendResponse";
import { send } from "node:process";

const handleStripeWebhookEvent = catchAsync(
    (req: Request, res: Response, next: NextFunction) => {
        const signature = req.headers["stripe-signature"] as string;
        const webHookSecret = envVars.STRIPE_.WEBHOOK_SECRET;

        if (!signature || !webHookSecret) {
            return res.status(status.BAD_REQUEST).json({
                message: "Missing Stripe signature or webhook secret",
            });
        }

        let event;
        try {
            event = stripe.webhooks.constructEvent(
                req.body,
                signature,
                webHookSecret,
            );
        } catch (err) {
            console.error(
                `Error verifying Stripe webhook signature: ${err.message}`,
            );
            return res.status(status.BAD_REQUEST).json({
                message: `Webhook Error: ${err.message}`,
            });
        }

        try {
            const result = PaymentService.handleStripeWebhookEvent(event);

            sendResponse(res, {
                httpStatusCode: status.OK,
                success: true,
                message: "Stripe webhook event processed successfully",
                data: result,
            });
        } catch (err) {
            console.error(
                `Error processing Stripe webhook event: ${err.message}`,
            );
            sendResponse(res, {
                httpStatusCode: status.INTERNAL_SERVER_ERROR,
                success: false,
                message: `Error processing webhook event: ${err.message}`,
            });
        }
    },
);

export const PaymentController = {
    handleStripeWebhookEvent,
};
