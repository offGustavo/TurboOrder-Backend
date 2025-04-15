import express from "express";
import { getCardapioByDate, saveOrUpdateCardapio } from "../controllers/cardapio.js";

const router = express.Router();

router.get("/", getCardapioByDate);
router.post("/", saveOrUpdateCardapio);

export default router;
