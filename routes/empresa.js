import express from "express";
import { createEmpresa, getEmpresas, getEmpresaById, deleteEmpresa } from "../controllers/empresa.js";

const router = express.Router();

router.post("/", createEmpresa);
router.get("/", getEmpresas);
router.get("/:id", getEmpresaById);
router.patch("/:id", deleteEmpresa)

export default router;


