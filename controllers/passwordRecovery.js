import { db } from "../db.js";
import bcrypt from "bcrypt";
import { sendVerificationCode } from "../service/emailService.js";

const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const forgotPassword = (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email é obrigatório" });
  }

  const sqlCheck = `
    SELECT fun_id, fun_verificado, fun_role 
    FROM fun_funcionario 
    WHERE fun_email = ? AND fun_ativo = TRUE
  `;

  db.query(sqlCheck, [email], (err, results) => {
    if (err) return res.status(500).json({ error: "Erro no banco de dados", details: err.message });

    if (results.length === 0) {
      return res.status(404).json({ error: "Email não cadastrado" });
    }

    const user = results[0];

    if (user.fun_role !== "admin") {
      return res.status(403).json({ error: "Acesso negado. Usuário não é administrador." });
    }

    if (!user.fun_verificado) {
      return res.status(403).json({ error: "Email ainda não verificado." });
    }

    const code = generateVerificationCode();

    const sqlUpdate = `
      UPDATE fun_funcionario 
      SET fun_codigo_verificacao = ? 
      WHERE fun_email = ?
    `;

    db.query(sqlUpdate, [code, email], (err2) => {
      if (err2) return res.status(500).json({ error: "Erro ao salvar código", details: err2.message });

      const resetLink = `http://localhost:3000/redefinir-senha?email=${encodeURIComponent(email)}&code=${code}`;

      const emailHtml = `
        <p>Você solicitou a redefinição de senha.</p>
        <p>Use o código abaixo para redefinir sua senha:</p>
        <h3>${code}</h3>
        <p>Ou clique no link abaixo:</p>
        <a href="${resetLink}">${resetLink}</a>
      `;

      sendVerificationCode(email, emailHtml)
        .then(() => res.json({ message: "Código de verificação enviado para o email." }))
        .catch((emailErr) =>
          res.status(500).json({ error: "Erro ao enviar email", details: emailErr.message })
        );
    });
  });
};

export const resetPassword = (req, res) => {
  const { email, code, novaSenha, confirmarSenha } = req.body;

  if (!email || !code || !novaSenha || !confirmarSenha) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios" });
  }

  if (novaSenha !== confirmarSenha) {
    return res.status(400).json({ error: "As senhas não coincidem" });
  }

  const sqlCheck = `
    SELECT fun_id, fun_codigo_verificacao, fun_verificado 
    FROM fun_funcionario 
    WHERE fun_email = ? AND fun_ativo = TRUE
  `;

  db.query(sqlCheck, [email], async (err, results) => {
    if (err) return res.status(500).json({ error: "Erro no banco de dados", details: err.message });

    if (results.length === 0) {
      return res.status(404).json({ error: "Email não cadastrado" });
    }

    const user = results[0];

    if (!user.fun_verificado) {
      return res.status(403).json({ error: "Email ainda não verificado." });
    }

    if (user.fun_codigo_verificacao !== code) {
      return res.status(400).json({ error: "Código de verificação inválido" });
    }

    try {
      const hashedPassword = await bcrypt.hash(novaSenha, 10);

      const sqlUpdate = `
        UPDATE fun_funcionario 
        SET fun_senha = ?, fun_codigo_verificacao = NULL 
        WHERE fun_email = ?
      `;

      db.query(sqlUpdate, [hashedPassword, email], (err2) => {
        if (err2) return res.status(500).json({ error: "Erro ao atualizar senha", details: err2.message });

        return res.json({ message: "Senha redefinida com sucesso" });
      });
    } catch (hashErr) {
      return res.status(500).json({ error: "Erro ao criptografar a senha", details: hashErr.message });
    }
  });
};