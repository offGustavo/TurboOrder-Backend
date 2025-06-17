import express from "express";
import { createEmpresa, getEmpresas, getEmpresaById, deleteEmpresa, editEmpresaById } from "../controllers/empresa.js";

const router = express.Router();

router.post("/", createEmpresa);
router.get("/", getEmpresas);
router.get("/:id", getEmpresaById);
router.patch("/:id", deleteEmpresa)
router.put("/:id", editEmpresaById);

export default router;


