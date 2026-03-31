import status from "http-status";
import { JwtPayload } from "jsonwebtoken";
import { Role, UserStatus } from "../../../generated/prisma/client.js";
import { envVars } from "../../config/env.js";
import AppError from "../../errorHealpers/AppError.js";
import { IRequestUser } from "../../interfaces/requestUser.interface.js";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { jwtUtils } from "../../utils/jwt.js";
import { tokenUtils } from "../../utils/token.js";
import {
    IChangePassword,
    ILoginUser,
    IRegisterPatient,
} from "./user.interface.js";

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

const getMe = async (user: IRequestUser) => {
    const isUserExist = await prisma.user.findUnique({
        where: {
            id: user.userId,
        },
        include: {
            patient: {
                include: {
                    appointments: true,
                    reviews: true,
                    prescriptions: true,
                    medicalReports: true,
                    patientHealthData: true,
                },
            },
            doctor: {
                include: {
                    specialties: true,
                    appointments: true,
                    reviews: true,
                },
            },
            admin: true,
        },
    });

    if (!isUserExist) {
        throw new AppError(status.NOT_FOUND, "User not found");
    }
};

const getNewToken = async (refreshToken: string, sessionToken: string) => {
    const isSessionTokenExist = await prisma.session.findUnique({
        where: {
            token: sessionToken,
        },
        include: {
            user: true,
        },
    });

    if (!isSessionTokenExist) {
        throw new AppError(status.UNAUTHORIZED, "Invalid session token");
    }

    const verifyRefreshToken = jwtUtils.verifyToken(
        refreshToken,
        envVars.REFRESH_TOKEN_SECRET as string,
    );

    if (!verifyRefreshToken && verifyRefreshToken.error) {
        throw new AppError(status.UNAUTHORIZED, "Invalid refresh token");
    }

    const data = verifyRefreshToken.data as JwtPayload;

    const newAccessToken = tokenUtils.getAccessToken({
        userId: data.user.id,
        role: data.user.role as Role,
        name: data.user.name,
        email: data.user.email,
        status: data.user.status,
        isDeleted: data.user.isDeleted,
        emailVerified: data.user.emailVerified,
    });
    const newRefreshToken = tokenUtils.getRefreshToken({
        userId: data.user.id,
        role: data.user.role as Role,
        name: data.user.name,
        email: data.user.email,
        status: data.user.status,
        isDeleted: data.user.isDeleted,
        emailVerified: data.user.emailVerified,
    });

    const { token } = await prisma.session.update({
        where: {
            token: sessionToken,
        },
        data: {
            token: sessionToken,
            expiresAt: new Date(Date.now() + 60 * 60 * 60 * 24), // 1 day
            updatedAt: new Date(),
        },
    });

    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        sessionToken: token,
    };
};

const changePassword = async (
    payload: IChangePassword,
    sessionToken: string,
) => {
    const session = await auth.api.getSession({
        headers: {
            Authorization: `Bearer ${sessionToken}`,
        },
    });

    if (!session || !session.user) {
        throw new AppError(status.UNAUTHORIZED, "Invalid session token");
    }

    const { currentPassword, newPassword } = payload;

    const result = await auth.api.changePassword({
        body: {
            currentPassword,
            newPassword,
            revokeOtherSessions: true,
        },
        headers: {
            Authorization: `Bearer ${sessionToken}`,
        },
    });

    const newAccessToken = tokenUtils.getAccessToken({
        userId: session.user.id,
        role: session.user.role as Role,
        name: session.user.name,
        email: session.user.email,
        status: session.user.status,
        isDeleted: session.user.isDeleted,
        emailVerified: session.user.emailVerified,
    });
    const newRefreshToken = tokenUtils.getRefreshToken({
        userId: session.user.id,
        role: session.user.role as Role,
        name: session.user.name,
        email: session.user.email,
        status: session.user.status,
        isDeleted: session.user.isDeleted,
        emailVerified: session.user.emailVerified,
    });

    return {
        ...result,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
    };
};

const logoutUser = async (sessionToken: string) => {
    const result = await auth.api.signOut({
        headers: {
            Authorization: `Bearer ${sessionToken}`,
        },
    });

    return result;
};

const verifyEmailOTP = async (email: string, otp: string) => {
    const result = await auth.api.verifyEmailOTP({
        body: {
            email,
            otp,
        },
    });

    if (result.status && !result.user.emailVerified) {
        await prisma.user.update({
            where: {
                email,
            },
            data: {
                emailVerified: true,
            },
        });
    }

    return result;
};

export const AuthService = {
    registerPatient,
    loginUser,
    getMe,
    getNewToken,
    changePassword,
    logoutUser,
    verifyEmailOTP,
};
