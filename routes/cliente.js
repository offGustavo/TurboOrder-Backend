import express from "express";
import { getClient, addClient, updateClient, deleteClient, getClientByPhone } from "../controllers/cliente.js";

const router = express.Router();

router.get("/", getClient);
router.post("/", addClient);
router.put("/:cli_id", updateClient); 
router.delete("/:cli_id", deleteClient); 
router.get("/telefone/:telefone", getClientByPhone);

export default router;