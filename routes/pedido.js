import express from "express";
import { createPedido, getPedidos, updatePedidoStatus } from "../controllers/pedido.js";

const router = express.Router();

router.post("/", createPedido);
router.get("/", getPedidos);
router.put('/:id', updatePedidoStatus);

export default router;
