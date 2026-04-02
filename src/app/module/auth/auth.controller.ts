import { Request, Response } from "express";
import status from "http-status";
import { envVars } from "../../config/env";
import AppError from "../../errorHealpers/AppError";
import catchAsync from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { cookieUtils } from "../../utils/cookie";
import { tokenUtils } from "../../utils/token";
import { AuthService } from "./auth.service";
import { auth } from "../../lib/auth";

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

const forgetPassword = catchAsync(async (req: Request, res: Response) => {
    const { email } = req.body;
    const result = await AuthService.forgetPassword(email);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Password reset OTP sent successfully",
        data: result,
    });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
    const { email, otp, newPassword } = req.body;
    const result = await AuthService.resetPassword(email, otp, newPassword);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Password reset successfully",
        data: result,
    });
});

// /api/v1/auth/login/google?redirect=/profile
const loginWithGoogle = catchAsync(async (req: Request, res: Response) => {
    const redirectPath = (req.query.redirect as string) || "/dashboard";

    const encodedRedirectPath = encodeURIComponent(redirectPath);

    const callbackUrl = `envVars.BETTER_AUTH_URL as string}/api/v1/auth/google/success?redirect=${encodedRedirectPath}`;

    res.render("googleRedirect", {
        callbackUrl,
        betterAuthUrl: envVars.BETTER_AUTH_URL,
    });
});

const googleLoginSuccess = catchAsync(async (req: Request, res: Response) => {
    const redirectPath = (req.query.redirect as string) || "/dashboard";

    const sessionToken = req.cookies["better-auth-session"];
    if (!sessionToken) {
        return res.redirect(
            `${envVars.FRONTEND_URL}/login?error=OAuth authentication failed`,
        );
    }

    const session = await auth.api.getSession({
        headers: {
            cookie: `better-auth-session=${sessionToken}`,
        },
    });

    if (!session) {
        return res.redirect(
            `${envVars.FRONTEND_URL}/login?error=No active session found after OAuth authentication`,
        );
    }

    if (!session || !session.user) {
        return res.redirect(
            `${envVars.FRONTEND_URL}/login?error=OAuth authentication failed`,
        );
    }

    const result = await AuthService.googleLoginSuccess(session);

    const { accessToken, refreshToken, token, ...rest } = result;

    tokenUtils.setAccessToken(res, accessToken);
    tokenUtils.setRefreshToken(res, refreshToken);

    const isValidRedirect =
        redirectPath.startsWith("/") && !redirectPath.startsWith("//");
    const finalRedirect = isValidRedirect ? redirectPath : "/dashboard";

    res.redirect(`${envVars.FRONTEND_URL}${finalRedirect}`);
});

const handleOauthError = catchAsync(async (req: Request, res: Response) => {
    const error = (req.query.error as string) || "Oauth-failed";

    res.redirect(
        `${envVars.FRONTEND_URL}/login?error=${encodeURIComponent(error)}`,
    );
});

export const AuthController = {
    registerPatient,
    loginUser,
    getMe,
    getNewToken,
    changePassword,
    logoutUser,
    verifyEmailOTP,
    forgetPassword,
    resetPassword,
    loginWithGoogle,
    googleLoginSuccess,
    handleOauthError,
};
