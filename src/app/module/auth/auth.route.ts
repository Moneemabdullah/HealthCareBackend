import { Router } from "express";
import { AuthController } from "./auth.controller";
import { Role } from "../../../generated/prisma/enums";
import { CheckAuth } from "../../middleware/checkAuth";

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
router.post("/verify-email", AuthController.verifyEmail);

export const authRoute = router;
