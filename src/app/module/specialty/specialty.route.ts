import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { CheckAuth } from "../../middleware/checkAuth";
import { SpecialtyController } from "./specialty.controller";
import { multerUpload } from "../../config/multer.config";
import { validateRequest } from "../../middleware/validateRequest";
import { spec } from "node:test/reporters";
import { SpecialtyValidation } from "./specialty.validation";

const router = Router();

router.post(
    "/",
    CheckAuth(Role.ADMIN, Role.SUPER_ADMIN),
    multerUpload.single("file"),
    validateRequest(SpecialtyValidation.createSpecialtyZodSchema),
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
