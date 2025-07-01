import express from "express";
import { createEmpresa, getEmpresas, getEmpresaById, deleteEmpresa, editEmpresaById, getPedidosEmpresaMesAtual, getPedidosPorTelefoneFuncionario } from "../controllers/empresa.js";

const router = express.Router();

router.post("/", createEmpresa);
router.get("/", getEmpresas);
router.get("/:id", getEmpresaById);
router.patch("/:id", deleteEmpresa)
router.put("/:id", editEmpresaById);
router.get('/empresa/:id/pedidos-mes-atual', getPedidosEmpresaMesAtual);
router.get('/:telefone/pedidos', getPedidosPorTelefoneFuncionario);

export default router;


