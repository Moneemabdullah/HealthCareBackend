import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { CheckAuth } from "../../middleware/checkAuth";
import { AuthController } from "./auth.controller";

const router = Router();

router.post("/register-patient", AuthController.registerPatient);
router.post("/login-user", AuthController.loginUser);
router.get(
    "/me",
    CheckAuth(Role.ADMIN, Role.PATIENT, Role.DOCTOR, Role.SUPER_ADMIN),
    AuthController.getMe,
);
router.post("/refresh-token", AuthController.getNewToken);
router.post(
    "/change-password",
    CheckAuth(Role.ADMIN, Role.PATIENT, Role.DOCTOR, Role.SUPER_ADMIN),
    AuthController.changePassword,
);
router.post(
    "/logout",
    CheckAuth(Role.ADMIN, Role.PATIENT, Role.DOCTOR, Role.SUPER_ADMIN),
    AuthController.logoutUser,
);
router.post("/verify-email", AuthController.verifyEmailOTP);
router.post("/forget-password", AuthController.forgetPassword);
router.post("/reset-password", AuthController.resetPassword);

router.get("/login-google", AuthController.loginWithGoogle);
// router.get("/login/google/callback", AuthController.googleCallback);
router.get("/google/success", AuthController.googleLoginSuccess);
router.get("/oauth/error", AuthController.handleOauthError);

export const authRoute = router;
