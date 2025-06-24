import { db } from "../db.js";

// Middleware para verificar se o usuário é um admin aprovado
export const isApprovedAdmin = (req, res, next) => {
  // Aqui assumimos que o e-mail do usuário já foi adicionado ao req.user.email
  // (por um middleware de autenticação anterior)
  const userEmail = req.user && req.user.email;

  // Se o e-mail não estiver presente, o usuário não está autenticado
  if (!userEmail) {
    return res.status(401).json({ Error: "Usuário não autenticado" });
  }

  // Consulta para verificar se o usuário é admin e se já foi aprovado
  const sql = `
    SELECT fun_role, fun_admin_approved 
    FROM fun_funcionario 
    WHERE fun_email = ?
  `;

  db.query(sql, [userEmail], (err, data) => {
    if (err) {
      return res.status(500).json({
        Error: "Erro ao verificar usuário",
        Details: err.message
      });
    }

    // Se não encontrar o usuário
    if (data.length === 0) {
      return res.status(404).json({ Error: "Usuário não encontrado" });
    }

    const user = data[0];

    // Se o usuário não for admin ou não estiver aprovado
    if (user.fun_role !== "admin" || !user.fun_admin_approved) {
      return res.status(403).json({ Error: "Acesso negado. Admin não aprovado." });
    }

    // Se tudo estiver certo, permite continuar
    next();
  });
};

// Middleware de verificação de token que decodifica o token e adiciona req.user e req.adminId
import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Token não fornecido" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token inválido" });

  jwt.verify(token, process.env.JWT_SECRET || "jwt-secret-key", (err, user) => {
    if (err) {
      console.log("Token inválido:", err);
      return res.status(403).json({ error: "Token inválido" });
    }

    console.log("Token verificado com sucesso:", user);
    req.user = user;
    req.adminId = user.id; // token payload has id field
    next();
  });
};
