import z from "zod";
import { Gender } from "../../../generated/prisma/enums";

export const createDoctorZodSchema = z.object({
    password: z
        .string("Password is required")
        .min(6, "Password must be at least 6 characters long"),
    doctor: {
        name: z
            .string("Name is required")
            .min(5, "Name must be at least 5 characters long")
            .max(30, "Name must be at most 30 characters long"),

        email: z.email("Invalid email format"),
        contactNumber: z
            .string("Contact number is required")
            .length(11, "Contact number must be exactly 11 digits"),
        address: z
            .string("Address is required")
            .min(10, "Address must be at least 10 characters long")
            .max(100, "Address must be at most 100 characters long")
            .optional(),

        registrationNumber: z
            .string("Registration number is required")
            .min(5, "Registration number must be at least 5 characters long")
            .max(20, "Registration number must be at most 20 characters long"),

        experience: z
            .number("Experience must be a number")
            .nonnegative("Experience cannot be negative")
            .optional(),

        gender: z.enum(
            [Gender.MALE, Gender.FEMALE],
            "Gender must be either 'MALE' or 'FEMALE'",
        ),

        appointmentsFee: z
            .number("Appointments fee must be a number")
            .nonnegative("Appointments fee cannot be negative"),

        qualifications: z
            .string("Qualifications are required")
            .min(10, "Qualifications must be at least 10 characters long")
            .max(100, "Qualifications must be at most 100 characters long"),
        currentlyWorkingPlace: z
            .string("Currently working place is required")
            .min(
                5,
                "Currently working place must be at least 5 characters long",
            )
            .max(
                50,
                "Currently working place must be at most 50 characters long",
            ),
        designation: z
            .string("Designation is required")
            .min(3, "Designation must be at least 3 characters long")
            .max(50, "Designation must be at most 50 characters long"),
    },
    specialties: z.array(
        z
            .string("Specialty ID must be a string")
            .uuid("Invalid UUID format")
            .min(1, "at least one specialty ID is required"),
    ),
});
