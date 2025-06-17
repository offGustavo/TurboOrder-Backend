import jwt from "jsonwebtoken";
import { db } from "../db.js";
import path from "path";

export const getUserInfo = (req, res) => {
  const userId = req.user.id;

  const sql = "SELECT fun_id, fun_nome, fun_email, fun_role, fun_foto FROM fun_funcionario WHERE fun_id = ?";

  db.query(sql, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ Error: "Erro no banco de dados", Details: err });
    }

    if (results.length === 0) {
      return res.status(404).json({ Error: "Usuário não encontrado" });
    }

    const user = results[0];
    return res.json({
      Status: "Success",
      id: user.fun_id,
      nome: user.fun_nome,
      email: user.fun_email,
      role: user.fun_role,
      foto: user.fun_foto,
    });
  });
};

export const updateUserProfile = (req, res) => {
  const userId = req.user.id;
  const { nome, email } = req.body;
  let foto = null;

  if (req.file) {
    foto = req.file.filename;
  }

  const updates = [];
  const params = [];

  if (nome) {
    updates.push("fun_nome = ?");
    params.push(nome);
  }

  if (email) {
    updates.push("fun_email = ?");
    params.push(email);
  }

  if (foto) {
    updates.push("fun_foto = ?");
    params.push(foto);
  }

  if (updates.length === 0) {
    return res.status(400).json({ Error: "Nenhum campo para atualizar" });
  }

  const sql = `UPDATE fun_funcionario SET ${updates.join(", ")} WHERE fun_id = ?`;
  params.push(userId);

  db.query(sql, params, (err, result) => {
    if (err) {
      return res.status(500).json({ Error: "Erro ao atualizar perfil", Details: err });
    }

    return res.json({ Status: "Success", Message: "Perfil atualizado com sucesso" });
  });
};
