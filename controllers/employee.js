import { db } from "../db.js";
import bcrypt from "bcrypt";

function getAdminPrincipalIdFromDB(userId) {
  return new Promise((resolve, reject) => {
    const sql = "SELECT admin_owner_id, fun_id FROM fun_funcionario WHERE fun_id = ?";
    db.query(sql, [userId], (err, results) => {
      if (err) return reject(err);
      if (results.length === 0) return reject(new Error("Usuário não encontrado"));

      const adminOwnerId = results[0].admin_owner_id || results[0].fun_id;
      resolve(adminOwnerId);
    });
  });
}

export const getEmployees = async (req, res) => {
  try {
    const userId = req.user.id;
    const adminPrincipalId = await getAdminPrincipalIdFromDB(userId);

    const sql = `
      SELECT fun_id, fun_nome, fun_email, fun_role
      FROM fun_funcionario
      WHERE fun_ativo = 1 AND (fun_id = ? OR admin_owner_id = ?)
    `;

    db.query(sql, [adminPrincipalId, adminPrincipalId], (err, data) => {
      if (err) return res.status(500).json({ error: "Erro ao buscar funcionários" });
      res.json(data);
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "Erro interno" });
  }
};

export const createEmployee = async (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password || password.length < 8 || !role) {
    return res.status(400).json({ error: "Nome, email, senha (mínimo 8 caracteres) e função são obrigatórios" });
  }

  try {
    const adminPrincipalId = await getAdminPrincipalIdFromDB(req.user.id);

    const checkEmailSql = "SELECT * FROM fun_funcionario WHERE fun_email = ?";
    db.query(checkEmailSql, [email], (err, data) => {
      if (err) return res.status(500).json({ error: "Erro ao verificar email" });
      if (data.length > 0) return res.status(400).json({ error: "Email já cadastrado" });

      bcrypt.hash(password, 10, (err, hash) => {
        if (err) return res.status(500).json({ error: "Erro ao criptografar a senha" });

        const insertSql = "INSERT INTO fun_funcionario (fun_nome, fun_email, fun_senha, fun_role, admin_owner_id, fun_ativo) VALUES (?, ?, ?, ?, ?, 1)";
        db.query(insertSql, [username, email, hash, role, adminPrincipalId], (err, result) => {
          if (err) return res.status(500).json({ error: "Erro ao criar funcionário" });
          res.status(201).json({ message: "Funcionário criado com sucesso", id: result.insertId });
        });
      });
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "Erro interno" });
  }
};

export const updateEmployee = async (req, res) => {
  const { id } = req.params;
  const { username, email, password, role } = req.body;

  if (!username || !email || !role) {
    return res.status(400).json({ error: "Nome, email e função são obrigatórios" });
  }

  try {
    const adminPrincipalId = await getAdminPrincipalIdFromDB(req.user.id);

    const checkSql = "SELECT fun_id, admin_owner_id FROM fun_funcionario WHERE fun_id = ?";
    db.query(checkSql, [id], (err, results) => {
      if (err) return res.status(500).json({ error: "Erro ao buscar funcionário" });
      if (results.length === 0) return res.status(404).json({ error: "Funcionário não encontrado" });

      const targetUser = results[0];

      if (targetUser.admin_owner_id === null) {
        return res.status(403).json({ error: "Não é permitido alterar o administrador principal." });
      }

      if (targetUser.admin_owner_id !== adminPrincipalId) {
        return res.status(403).json({ error: "Não autorizado a alterar este funcionário." });
      }

      const updateSql = password
        ? "UPDATE fun_funcionario SET fun_nome = ?, fun_email = ?, fun_senha = ?, fun_role = ? WHERE fun_id = ?"
        : "UPDATE fun_funcionario SET fun_nome = ?, fun_email = ?, fun_role = ? WHERE fun_id = ?";

      if (password) {
        bcrypt.hash(password, 10, (err, hash) => {
          if (err) return res.status(500).json({ error: "Erro ao criptografar a senha" });
          db.query(updateSql, [username, email, hash, role, id], (err) => {
            if (err) return res.status(500).json({ error: "Erro ao atualizar funcionário" });
            res.json({ message: "Funcionário atualizado com sucesso" });
          });
        });
      } else {
        db.query(updateSql, [username, email, role, id], (err) => {
          if (err) return res.status(500).json({ error: "Erro ao atualizar funcionário" });
          res.json({ message: "Funcionário atualizado com sucesso" });
        });
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "Erro interno" });
  }
};

export const deleteEmployee = async (req, res) => {
  const { id } = req.params;

  try {
    const adminPrincipalId = await getAdminPrincipalIdFromDB(req.user.id);

    const checkSql = "SELECT fun_id, admin_owner_id FROM fun_funcionario WHERE fun_id = ?";
    db.query(checkSql, [id], (err, results) => {
      if (err) return res.status(500).json({ error: "Erro ao buscar funcionário" });
      if (results.length === 0) return res.status(404).json({ error: "Funcionário não encontrado" });

      const targetUser = results[0];

      if (targetUser.admin_owner_id === null) {
        return res.status(403).json({ error: "Não é permitido excluir o administrador principal." });
      }

      if (targetUser.admin_owner_id !== adminPrincipalId) {
        return res.status(403).json({ error: "Não autorizado a excluir este funcionário." });
      }

      const updateSql = "UPDATE fun_funcionario SET fun_ativo = 0 WHERE fun_id = ?";
      db.query(updateSql, [id], (err, result) => {
        if (err) return res.status(500).json({ error: "Erro ao desativar funcionário" });
        if (result.affectedRows === 0) return res.status(404).json({ error: "Funcionário não encontrado" });
        res.json({ message: "Funcionário desativado com sucesso" });
      });
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "Erro interno" });
  }
};
