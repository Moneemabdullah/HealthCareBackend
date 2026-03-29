import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { Role, UserStatus } from "../../generated/prisma/client.js";
import { prisma } from "./prisma";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),

    emailAndPassword: {
        enabled: true,
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
            idDeleted: {
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

    // trustedOrigin: process.env.TRUSTED_ORIGIN || "http://localhost:3000",
});
