import { Router } from "express";
import { UserController } from "./user.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { createDoctorZodSchema } from "./user.validation";

const router = Router();

router.put(
    "/create-doctor",
    validateRequest(createDoctorZodSchema),
    UserController.createDoctor,
);
// router.put("/create-admin", UserController.createAdmin);
// router.put("/create-super-admin", UserController.createSuperAdmin);

export const userRoutes = router;
