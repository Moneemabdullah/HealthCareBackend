import { UserStatus } from "../../../generated/prisma/client.js";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";

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
        throw new Error("Failed to register patient");
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

        return { ...data, patient };
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
        throw new Error("Invalid email or password");
    }

    if (data.user.status === UserStatus.BLOCKED) {
        throw new Error("Your account has been blocked");
    }

    if (data.user.idDeleted) {
        throw new Error("Your account has been deleted");
    }

    return data;
};

export const AuthService = {
    registerPatient,
    loginUser,
};
