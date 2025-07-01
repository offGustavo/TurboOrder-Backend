import express from "express";
import { getDailyRevenue, getWeeklyRevenue, getMonthlyRevenue } from "../controllers/receita.js";

const router = express.Router();

router.get("/daily", getDailyRevenue);
router.get("/weekly", getWeeklyRevenue);
router.get("/monthly", getMonthlyRevenue);

export default router;
