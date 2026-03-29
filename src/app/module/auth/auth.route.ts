import { Router } from "express";
import { AuthController } from "./auth.controller";

const router = Router();

router.post("/register-patient", AuthController.registerPatient);
router.post("/login-user", AuthController.loginUser);

export const authRoute = router;
