import express from "express";
import { addUser, verifyCode } from "../controllers/register.js";

const router = express.Router();

router.post("/", addUser);
router.post("/verify", verifyCode);

export default router;