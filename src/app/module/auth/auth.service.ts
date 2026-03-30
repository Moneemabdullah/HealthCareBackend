import status from "http-status";
import { Role, UserStatus } from "../../../generated/prisma/client.js";
import AppError from "../../errorHealpers/AppError.js";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { tokenUtils } from "../../utils/token.js";

interface IRegisterPatient {
    name: string;
    email: string;
    password: string;
}

const registerPatient = async (payload: IRegisterPatient) => {
    const { name, email, password } = payload;

    const data = await auth.api.signUpEmail({
        body: {
            email,
            password,
            name,
        },
    });

    if (!data.user) {
        throw new AppError(status.BAD_REQUEST, "Failed to create user");
    }

    try {
        const patient = await prisma.$transaction(async (tx) => {
            const patientTx = await tx.patient.create({
                data: {
                    userId: data.user.id,
                    name: payload.name,
                    email: payload.email,
                },
            });
            return patientTx;
        });

        const accessToken = tokenUtils.getAccessToken({
            userId: data.user.id,
            role: data.user.role as Role,
            name: data.user.name,
            email: data.user.email,
            status: data.user.status,
            isDeleted: data.user.isDeleted,
            emailVerified: data.user.emailVerified,
        });
        const refreshToken = tokenUtils.getRefreshToken({
            userId: data.user.id,
            role: data.user.role as Role,
            name: data.user.name,
            email: data.user.email,
            status: data.user.status,
            isDeleted: data.user.isDeleted,
            emailVerified: data.user.emailVerified,
        });
        return {
            ...data,
            accessToken,
            refreshToken,
            patient,
        };
    } catch (error) {
        prisma.user.delete({
            where: {
                id: data.user.id,
            },
        });
        throw error;
    }
};

interface ILoginUser {
    email: string;
    password: string;
}

const loginUser = async (payload: ILoginUser) => {
    const { email, password } = payload;
    const data = await auth.api.signInEmail({
        body: {
            email,
            password,
        },
    });

    if (!data.user) {
        throw new AppError(status.BAD_REQUEST, "Invalid email or password");
    }

    if (data.user.status === UserStatus.BLOCKED) {
        throw new AppError(status.FORBIDDEN, "Your account has been blocked");
    }

    if (data.user.isDeleted) {
        throw new AppError(status.GONE, "Your account has been deleted");
    }

    const accessToken = tokenUtils.getAccessToken({
        userId: data.user.id,
        role: data.user.role as Role,
        name: data.user.name,
        email: data.user.email,
        status: data.user.status,
        isDeleted: data.user.isDeleted,
        emailVerified: data.user.emailVerified,
    });
    const refreshToken = tokenUtils.getRefreshToken({
        userId: data.user.id,
        role: data.user.role as Role,
        name: data.user.name,
        email: data.user.email,
        status: data.user.status,
        isDeleted: data.user.isDeleted,
        emailVerified: data.user.emailVerified,
    });
    return { ...data, accessToken, refreshToken };
};

export const AuthService = {
    registerPatient,
    loginUser,
};
