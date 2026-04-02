import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { SpecialtyService } from "./specialty.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";

const createSpecialty = catchAsync(async (req: Request, res: Response) => {
    const payload = {
        ...req.body,
        image: req.file?.path,
    };
    const result = await SpecialtyService.createSpecialty(payload);

    sendResponse(res, {
        httpStatusCode: status.CREATED,
        success: true,
        message: "Specialty created successfully",
        data: result,
    });
});

const getAllSpecialties = catchAsync(async (req: Request, res: Response) => {
    const specialties = await SpecialtyService.getAllSpecialties();

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Specialties retrieved successfully",
        data: specialties,
    });
});

const updateSpecialty = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const payload = req.body;
    const updatedSpecialty = await SpecialtyService.updateSpecialty(
        id as string,
        payload,
    );
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Specialty updated successfully",
        data: updatedSpecialty,
    });
});

const deleteSpecialty = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const deletedSpecialty = await SpecialtyService.deleteSpecialty(
        id as string,
    );
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Specialty deleted successfully",
        data: deletedSpecialty,
    });
});

export const SpecialtyController = {
    createSpecialty,
    getAllSpecialties,
    updateSpecialty,
    deleteSpecialty,
};
