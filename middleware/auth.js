import { db } from "../db.js";
import jwt from "jsonwebtoken";

// Middleware de verificação de token
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Token inválido" });
  }

  jwt.verify(token, process.env.JWT_SECRET || "jwt-secret-key", (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Token inválido" });
    }

    req.user = user;
    req.adminId = user.id; // Adiciona o ID do usuário no req
    next();
  });
};

// Middleware para verificar se o usuário é um admin aprovado
export const isApprovedAdmin = (req, res, next) => {
  const userEmail = req.user?.email;

  if (!userEmail) {
    return res.status(401).json({ error: "Usuário não autenticado" });
  }

  const sql = `
    SELECT fun_role, fun_admin_approved 
    FROM fun_funcionario 
    WHERE fun_email = ?
  `;

  db.query(sql, [userEmail], (err, data) => {
    if (err) {
      return res.status(500).json({
        error: "Erro ao verificar usuário",
        details: err.message
      });
    }

    if (data.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const user = data[0];

    if (user.fun_role !== "admin" || !user.fun_admin_approved) {
      return res.status(403).json({ error: "Acesso negado. Admin não aprovado." });
    }

    next(); // Permite o acesso
  });
};