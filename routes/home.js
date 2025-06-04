import express from "express";
import { verifyUser } from "../controllers/home.js";
import cookieParser from "cookie-parser";

const router = express.Router();

router.get("/", verifyUser, (req, res) => {
    return res.json({ Status: "Success", username: req.username });
});

router.get("/logout", (req, res) => {
    res.clearCookie('token');
    return res.json({ Status: "Success" });
});

export default router;