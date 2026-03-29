import { NextFunction } from "express";
import { Specialty } from "../../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma";

const createSpecialty = async (payload: Specialty): Promise<Specialty> => {
    const specialty = await prisma.specialty.create({
        data: payload,
    });

    return specialty;
};

const getAllSpecialties = async (): Promise<Specialty[]> => {
    const specialties = await prisma.specialty.findMany({
        where: { isDeleted: false },
    });
    return specialties;
};

const updateSpecialty = async (
    id: string,
    payload: Specialty,
): Promise<Specialty> => {
    const updatedSpecialty = await prisma.specialty.update({
        where: { id },
        data: payload,
    });
    return updatedSpecialty;
};

const deleteSpecialty = async (id: string): Promise<Specialty> => {
    const deletedSpecialty = await prisma.specialty.delete({
        where: { id },
    });
    return deletedSpecialty;
};

export const SpecialtyService = {
    createSpecialty,
    getAllSpecialties,
    deleteSpecialty,
    updateSpecialty,
};
