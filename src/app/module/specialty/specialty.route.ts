import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { CheckAuth } from "../../middleware/checkAuth";
import { SpecialtyController } from "./specialty.controller";

const router = Router();

router.post(
    "/",
    CheckAuth(Role.ADMIN, Role.SUPER_ADMIN),
    SpecialtyController.createSpecialty,
);
router.put(
    "/:id",
    CheckAuth(Role.ADMIN, Role.SUPER_ADMIN),
    SpecialtyController.updateSpecialty,
);
router.get("/", SpecialtyController.getAllSpecialties);
router.delete(
    "/:id",
    CheckAuth(Role.ADMIN, Role.SUPER_ADMIN),
    SpecialtyController.deleteSpecialty,
);

export const SpecialtyRoute = router;
