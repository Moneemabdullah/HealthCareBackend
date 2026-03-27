import { Router } from "express";
import { SpecialtyController } from "./specialty.controller";

const router = Router();

router.post("/", SpecialtyController.createSpecialty);
router.put("/:id", SpecialtyController.updateSpecialty);
router.get("/", SpecialtyController.getAllSpecialties);
router.delete("/:id", SpecialtyController.deleteSpecialty);

export const SpecialtyRoute = router;
