import express from "express";
import { createPedido, editPedidos, getFiltredPedidos, getPedidos, updatePedidoStatus } from "../controllers/pedido.js";

const router = express.Router();

router.post("/", createPedido);
router.get("/", getPedidos);
router.put('/:id', editPedidos)
router.put('/:id/status', updatePedidoStatus);
router.get("/filtred", getFiltredPedidos);

export default router;
