import { Router } from "express";
import { SpecialtyRoute } from "../module/specialty/specialty.route";
import { authRoute } from "../module/auth/auth.route";
import { userRoutes } from "../module/user/user.route";
const router = Router();

router.use("/specialty", SpecialtyRoute);
router.use("/auth", authRoute);
router.use("/user", userRoutes);

export const IndexRoute = router;
