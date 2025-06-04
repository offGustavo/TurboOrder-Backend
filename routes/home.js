import express from "express";
import { verifyUser } from "../controllers/home.js";

const router = express.Router();

router.get("/", verifyUser, (req, res) => {
    return res.json({ Status: "Success", username: req.username });
});

export default router;