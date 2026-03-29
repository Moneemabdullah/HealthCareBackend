import { Gender } from "../../../generated/prisma/enums";

interface ICreateDoctor {
    password: string;
    doctor: {
        name: string;
        email: string;
        specialtyId: string;
        profilePhoto?: string;
        contactNumber?: string;
        address?: string;
        registrationNumber?: string;
        experience?: number;
        gender: Gender;
        appointmentsFee: number;
        qualifications: string;
        currentlyWorkingPlace: string;
        designation: string;
    };
    specialties: string[];
}

export type { ICreateDoctor };
