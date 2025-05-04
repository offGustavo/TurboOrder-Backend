import express from "express";
import { createPedido, getPedidos } from "../controllers/pedido.js";

const router = express.Router();

router.post("/", createPedido);
router.get("/", getPedidos);

export default router;
