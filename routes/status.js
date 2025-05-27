import express from "express";
import { getMounthSum, getProductSales, getProductSalesById, getWeekSum, getDaySum } from "../controllers/status.js";

const router = express.Router();

router.get('/soma-mensal', getMounthSum);
router.get('/soma-semanal', getWeekSum);
router.get('/soma-diaria/:dia_pedido', getDaySum);
router.get('/soma-produto', getProductSales)
router.get('/soma-produto/:id', getProductSalesById);

export default router;
