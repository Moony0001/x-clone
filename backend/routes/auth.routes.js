import express from "express";
import { login, logout, signup } from "../controllers/auth.controllers.js"; //Always add the .js extension or else it will crash


const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

export default router;