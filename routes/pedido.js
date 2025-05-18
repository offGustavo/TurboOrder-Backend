import express from "express";
import { createPedido, editPedidos, getPedidos, updatePedidoStatus, getMounthSum } from "../controllers/pedido.js";

const router = express.Router();

router.post("/", createPedido);
router.get("/", getPedidos);
router.put('/:id', editPedidos)
router.put('/:id/status', updatePedidoStatus);
router.get("/soma-mensal", getMounthSum)

export default router;
