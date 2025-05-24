import express from "express";
import { getMounthSum, getWeekSum } from "../controllers/status.js";

const router = express.Router();

router.get('/soma-mensal', getMounthSum);
router.get('/soma-semanal', getWeekSum);

export default router;
