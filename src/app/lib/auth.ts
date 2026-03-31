import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { bearer, emailOTP } from "better-auth/plugins";
import ms from "ms";
import { Role, UserStatus } from "../../generated/prisma/client.js";
import { prisma } from "./prisma";
import { sendEmail } from "../utils/emailServices.js";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),

    plugins: [
        bearer(),
        emailOTP({
            overrideDefaultEmailVerification: true,
            async sendVerificationOTP({ email, otp, type }) {
                if (type === "email-verification") {
                    const user = await prisma.user.findUnique({
                        where: { email },
                    });
                    if (user && !user.emailVerified) {
                        sendEmail({
                            to: email,
                            subject: "Verify your email",
                            template: "otp",
                            templateData: {
                                name: user.name,
                                otp,
                            },
                        }),
                        

                    }
                }
            },
            expiresIn: 2*60*1000, // 2 minutes
            otpLength: 6,
        }),
    ],

    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
    },

    emailVerification: {
        sendOnSignUp: true,
        sendOnSignIn: true,
        autoSignInAfterVerification: true,
    },

    user: {
        additionalFields: {
            role: {
                type: "string",
                required: true,
                defaultValue: Role.PATIENT,
            },
            status: {
                type: "string",
                required: true,
                defaultValue: UserStatus.ACTIVE,
            },
            needPasswordChange: {
                type: "boolean",
                required: true,
                defaultValue: false,
            },
            isDeleted: {
                type: "boolean",
                required: true,
                defaultValue: false,
            },
            DeletedAt: {
                type: "date",
                required: false,
                defaultValue: null,
            },
        },
    },

    session: {
        expiresIn: Number(
            ms(24 * 60 * 60 * 1000), // 1 day
        ),

        updateAge: Number(
            ms(24 * 60 * 60 * 1000), // 1 day
        ),
        cookieCache: {
            enabled: true,
            maxAge: Number(
                ms(24 * 60 * 60 * 1000), // 1 day
            ),
        },
    },
    // trustedOrigin: process.env.TRUSTED_ORIGIN || "http://localhost:3000",
});
