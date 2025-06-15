import express from "express";
import { isApprovedAdmin } from "../middleware/auth.js";
import { db } from "../db.js";

const router = express.Router();

// Rota para listar todos os administradores ainda não aprovados
router.get("/unapproved", isApprovedAdmin, (req, res) => {
  const sql = `
    SELECT fun_id, fun_nome, fun_email 
    FROM fun_funcionario 
    WHERE fun_role = 'admin' AND fun_admin_approved = FALSE
  `;
  db.query(sql, (err, data) => {
    if (err) {
      return res.status(500).json({
        Error: "Erro ao buscar administradores não aprovados",
        Details: err.message
      });
    }
    return res.json({ unapprovedAdmins: data });
  });
});

// Rota para aprovar um administrador com base no ID
router.post("/approve/:id", isApprovedAdmin, (req, res) => {
  const adminId = req.params.id;
  const sql = `
    UPDATE fun_funcionario 
    SET fun_admin_approved = TRUE 
    WHERE fun_id = ?
  `;
  db.query(sql, [adminId], (err, result) => {
    if (err) {
      return res.status(500).json({
        Error: "Erro ao aprovar administrador",
        Details: err.message
      });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ Error: "Administrador não encontrado" });
    }
    return res.json({ Status: "Administrador aprovado com sucesso" });
  });
});

export default router;
