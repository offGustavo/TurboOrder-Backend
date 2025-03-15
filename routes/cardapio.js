import express from "express";
import {
  getCardapioByDate,
  addCardapio,
  getItemsByCardapio,
  addItemToCardapio,
  removeItemFromCardapio,
} from "../controllers/cardapio.js";
const router = express.Router();

router.get("/", getCardapioByDate);
router.post("/", addCardapio);
router.get("/dia", getItemsByCardapio);
router.post("/dia", addItemToCardapio);
router.delete("/dia/:id", removeItemFromCardapio);

export default router;
