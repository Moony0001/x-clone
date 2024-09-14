import express from "express";
import { getMe, login, logout, signup } from "../controllers/auth.controllers.js"; //Always add the .js extension or else it will crash
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.get("/me", protectRoute, getMe);
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

export default router;