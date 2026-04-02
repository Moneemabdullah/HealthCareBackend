import z from "zod";

const createSpecialtyZodSchema = z.object({
    title: z.string().min(1, "Specialty name is required"),
    description: z.string().optional(),
});
export const SpecialtyValidation = {
    createSpecialtyZodSchema,
};
