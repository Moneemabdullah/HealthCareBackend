import { Request, Response } from "express";
import status from "http-status";
import catchAsync from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { tokenUtils } from "../../utils/token";
import { AuthService } from "./auth.service";
import AppError from "../../errorHealpers/AppError";
import { cookieUtils } from "../../utils/cookie";

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

const getMe = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const result = await AuthService.getMe(user);

    sendResponse(res, {
        httpStatusCode: status.OK,
        message: "User info retrieved successfully",
        data: result,
        success: true,
    });
});

const getNewToken = catchAsync(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    const betterAuthSessionToken = req.cookies["better-auth-session"];

    if (!refreshToken || !betterAuthSessionToken) {
        throw new AppError(
            status.UNAUTHORIZED,
            "Refresh token or session token is missing",
        );
    }

    const result = await AuthService.getNewToken(
        refreshToken,
        betterAuthSessionToken,
    );

    const {
        accessToken,
        refreshToken: newRefreshToken,
        sessionToken: newSessionToken,
    } = result;
    tokenUtils.setAccessToken(res, accessToken);
    tokenUtils.setRefreshToken(res, newRefreshToken);
    tokenUtils.setBetterAuthSessionCookies(res, newSessionToken);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "New tokens generated successfully",
        data: {
            accessToken,
            refreshToken: newRefreshToken,
            sessionToken: newSessionToken,
        },
    });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const sessionToken = req.cookies["better-auth-session"];
    if (!sessionToken) {
        throw new AppError(status.UNAUTHORIZED, "Session token is missing");
    }
    const result = await AuthService.changePassword(payload, sessionToken);

    tokenUtils.setAccessToken(res, result.accessToken);
    tokenUtils.setRefreshToken(res, result.refreshToken);
    tokenUtils.setBetterAuthSessionCookies(res, result.token as string);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Password changed successfully",
        data: result,
    });
});

const logoutUser = catchAsync(async (req: Request, res: Response) => {
    const sessionToken = req.cookies["better-auth-session"];
    if (!sessionToken) {
        throw new AppError(status.UNAUTHORIZED, "Session token is missing");
    }
    await AuthService.logoutUser(sessionToken);

    cookieUtils.clearCookie(res, "accessToken", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
    });
    cookieUtils.clearCookie(res, "refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
    });
    cookieUtils.clearCookie(res, "better-auth-session-token", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
    });
});

const verifyEmailOTP = catchAsync(async (req: Request, res: Response) => {
    const { email, otp } = req.body;
    const result = await AuthService.verifyEmailOTP(email, otp);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Email OTP verified successfully",
        data: result,
    });
});

export const AuthController = {
    registerPatient,
    loginUser,
    getMe,
    getNewToken,
    changePassword,
    logoutUser,
    verifyEmailOTP,
};
