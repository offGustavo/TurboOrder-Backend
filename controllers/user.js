import jwt from "jsonwebtoken";
import { db } from "../db.js";

export const getUserInfo = (req, res) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ Error: "Token não fornecido" });

  jwt.verify(token, "jwt-secret-key", (err, decoded) => {
    if (err) return res.status(403).json({ Error: "Token inválido" });

    const sql = "SELECT fun_id, fun_nome, fun_role, fun_email, fun_foto FROM fun_funcionario WHERE fun_id = ?";
    db.query(sql, [decoded.id], (err, data) => {
      if (err) return res.status(500).json({ Error: "Erro ao buscar informações do usuário", Details: err });
      if (data.length === 0) return res.status(404).json({ Error: "Usuário não encontrado" });

      const { fun_id, fun_nome, fun_role, fun_email, fun_foto } = data[0];
      return res.json({ id: fun_id, nome: fun_nome, email: fun_email, role: fun_role, foto: fun_foto });
    });
  });
};
