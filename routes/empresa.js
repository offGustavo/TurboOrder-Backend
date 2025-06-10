import express from "express";
import { createEmpresa } from "../controllers/empresa.js";

const router = express.Router();

router.post("/", createEmpresa);

export default router;
