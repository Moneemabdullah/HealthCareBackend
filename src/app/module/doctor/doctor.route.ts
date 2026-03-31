import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { CheckAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { DoctorController } from "./doctor.controller";
import { updateDoctorZodSchema } from "./doctor.validation";

const router = Router();

router.get(
    "/",
    // CheckAuth(Role.ADMIN, Role.SUPER_ADMIN),
    DoctorController.getAllDoctors,
);
router.get(
    "/:id",
    CheckAuth(Role.ADMIN, Role.SUPER_ADMIN),
    DoctorController.getDoctorById,
);
router.patch(
    "/:id",
    CheckAuth(Role.ADMIN, Role.SUPER_ADMIN),
    validateRequest(updateDoctorZodSchema),
    DoctorController.updateDoctor,
);
router.delete(
    "/:id",
    CheckAuth(Role.ADMIN, Role.SUPER_ADMIN),
    DoctorController.deleteDoctor,
);

export const DoctorRoutes = router;
