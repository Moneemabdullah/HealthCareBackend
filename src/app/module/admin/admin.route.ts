import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { CheckAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";

import { updateAdminZodSchema } from "./admin.validation";
import { AdminController } from "./admin.controller";

const router = Router();

router.get(
    "/",
    CheckAuth(Role.ADMIN, Role.SUPER_ADMIN),
    AdminController.getAllAdmins,
);
router.get(
    "/:id",
    CheckAuth(Role.ADMIN, Role.SUPER_ADMIN),
    AdminController.getAdminById,
);
router.patch(
    "/:id",
    CheckAuth(Role.SUPER_ADMIN),
    validateRequest(updateAdminZodSchema),
    AdminController.updateAdmin,
);
router.delete("/:id", CheckAuth(Role.SUPER_ADMIN), AdminController.deleteAdmin);

export const AdminRoutes = router;
