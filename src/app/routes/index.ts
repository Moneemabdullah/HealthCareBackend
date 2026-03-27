import { Router } from "express";
import { SpecialtyRoute } from "../module/specialty/specialty.route";
const router = Router();

router.use("/specialty", SpecialtyRoute);

export const IndexRoute = router;
