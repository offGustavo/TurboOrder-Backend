import { db } from "../db.js";
import bcrypt from "bcrypt";

export const getEmployees = (req, res) => {
  const adminOwnerId = req.adminId; // assuming middleware sets this
  const sql = "SELECT fun_id, fun_nome, fun_email, fun_role FROM fun_funcionario WHERE fun_ativo = true AND (fun_id = ? OR admin_owner_id = ?)";
  db.query(sql, [adminOwnerId, adminOwnerId], (err, data) => {
    if (err) return res.status(500).json({ error: "Erro ao buscar funcionários" });
    res.json(data);
  });
};

export const createEmployee = (req, res) => {
  const { username, email, password, role } = req.body;
  const adminOwnerId = req.adminId; // assuming middleware sets this

  if (!username || !email || !password || password.length < 8 || !role) {
    return res.status(400).json({ error: "Nome, email, senha (mínimo 8 caracteres) e função são obrigatórios" });
  }

  const checkEmailSql = "SELECT * FROM fun_funcionario WHERE fun_email = ?";
  db.query(checkEmailSql, [email], (err, data) => {
    if (err) return res.status(500).json({ error: "Erro ao verificar email" });
    if (data.length > 0) return res.status(400).json({ error: "Email já cadastrado" });

    const salt = 10;
    bcrypt.hash(password, salt, (err, hash) => {
      if (err) return res.status(500).json({ error: "Erro ao criptografar a senha" });

      const insertSql = "INSERT INTO fun_funcionario (fun_nome, fun_email, fun_senha, fun_role, admin_owner_id) VALUES (?, ?, ?, ?, ?)";
      db.query(insertSql, [username, email, hash, role, adminOwnerId], (err, result) => {
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

  const updateSql = password
    ? "UPDATE fun_funcionario SET fun_nome = ?, fun_email = ?, fun_senha = ?, fun_role = ? WHERE fun_id = ?"
    : "UPDATE fun_funcionario SET fun_nome = ?, fun_email = ?, fun_role = ? WHERE fun_id = ?";

  const updateValues = [];

  if (password) {
    const salt = 10;
    bcrypt.hash(password, salt, (err, hash) => {
      if (err) return res.status(500).json({ error: "Erro ao criptografar a senha" });
      updateValues.push(username, email, hash, role, id);
      db.query(updateSql, updateValues, (err) => {
        if (err) return res.status(500).json({ error: "Erro ao atualizar funcionário" });
        res.json({ message: "Funcionário atualizado com sucesso" });
      });
    });
  } else {
    updateValues.push(username, email, role, id);
    db.query(updateSql, updateValues, (err) => {
      if (err) return res.status(500).json({ error: "Erro ao atualizar funcionário" });
      res.json({ message: "Funcionário atualizado com sucesso" });
    });
  }
};

export const deleteEmployee = (req, res) => {
  const { id } = req.params;
  const updateSql = "UPDATE fun_funcionario SET fun_ativo = false WHERE fun_id = ?";
  db.query(updateSql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: "Erro ao desativar funcionário" });
    if (result.affectedRows === 0) return res.status(404).json({ error: "Funcionário não encontrado" });
    res.json({ message: "Funcionário desativado com sucesso" });
  });
};
