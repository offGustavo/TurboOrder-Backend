import { db } from "../db.js";
import bcrypt from "bcrypt";

export const getEmployees = (req, res) => {
  const sql = `
    SELECT fun_id, fun_nome, fun_email, fun_role
    FROM fun_funcionario
    WHERE fun_ativo = 1
  `;

  db.query(sql, (err, data) => {
    if (err) return res.status(500).json({ error: "Erro ao buscar funcionários" });
    res.json(data);
  });
};

export const createEmployee = (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password || password.length < 8 || !role) {
    return res.status(400).json({ error: "Nome, email, senha (mínimo 8 caracteres) e função são obrigatórios" });
  }

  const checkEmailSql = "SELECT * FROM fun_funcionario WHERE fun_email = ?";
  db.query(checkEmailSql, [email], (err, data) => {
    if (err) return res.status(500).json({ error: "Erro ao verificar email" });
    if (data.length > 0) return res.status(400).json({ error: "Email já cadastrado" });

    bcrypt.hash(password, 10, (err, hash) => {
      if (err) return res.status(500).json({ error: "Erro ao criptografar a senha" });

      const insertSql = "INSERT INTO fun_funcionario (fun_nome, fun_email, fun_senha, fun_role, fun_ativo) VALUES (?, ?, ?, ?, 1)";
      db.query(insertSql, [username, email, hash, role], (err, result) => {
        if (err) return res.status(500).json({ error: "Erro ao criar funcionário" });
        res.status(201).json({ message: "Funcionário criado com sucesso", id: result.insertId });
      });
    });
  });
};

export const updateEmployee = (req, res) => {
  const { id } = req.params;
  const { username, email, password, role } = req.body;

  if (!username || !email || !role) {
    return res.status(400).json({ error: "Nome, email e função são obrigatórios" });
  }

  const checkSql = "SELECT fun_id FROM fun_funcionario WHERE fun_id = ?";
  db.query(checkSql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: "Erro ao buscar funcionário" });
    if (results.length === 0) return res.status(404).json({ error: "Funcionário não encontrado" });

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
};

export const deleteEmployee = (req, res) => {
  const { id } = req.params;

  const checkSql = "SELECT fun_id FROM fun_funcionario WHERE fun_id = ?";
  db.query(checkSql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: "Erro ao buscar funcionário" });
    if (results.length === 0) return res.status(404).json({ error: "Funcionário não encontrado" });

    const updateSql = "UPDATE fun_funcionario SET fun_ativo = 0 WHERE fun_id = ?";
    db.query(updateSql, [id], (err, result) => {
      if (err) return res.status(500).json({ error: "Erro ao desativar funcionário" });
      if (result.affectedRows === 0) return res.status(404).json({ error: "Funcionário não encontrado" });
      res.json({ message: "Funcionário desativado com sucesso" });
    });
  });
};
