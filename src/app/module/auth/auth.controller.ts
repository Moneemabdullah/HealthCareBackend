import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { AuthService } from "./auth.service";
import status from "http-status";
import { tokenUtils } from "../../utils/token";

const registerPatient = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;

    const result = await AuthService.registerPatient(payload);

    const { accessToken, refreshToken, token, ...rest } = result;

    tokenUtils.setBetterAuthSessionCookies(res, token as string);
    tokenUtils.setAccessToken(res, accessToken);
    tokenUtils.setRefreshToken(res, refreshToken);

    sendResponse(res, {
        httpStatusCode: status.CREATED,
        success: true,
        message: "Patient registered successfully",
        data: {
            token,
            accessToken,
            refreshToken,
            ...rest,
        },
    });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const result = await AuthService.loginUser(payload);

    const { accessToken, refreshToken, token, ...rest } = result;

    tokenUtils.setBetterAuthSessionCookies(res, token);
    tokenUtils.setAccessToken(res, accessToken);
    tokenUtils.setRefreshToken(res, refreshToken);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "User logged in successfully",
        data: {
            token,
            accessToken,
            refreshToken,
            ...rest,
        },
    });
});

export const AuthController = {
    registerPatient,
    loginUser,
};
