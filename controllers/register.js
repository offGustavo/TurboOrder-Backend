import { db } from "../db.js";
import bcrypt from "bcrypt";
import { sendVerificationCode } from "../service/emailService.js";

export const addUser = (req, res) => {
  const { username, email, password } = req.body;

  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
  if (!emailRegex.test(email)) {
    return res.json({ Error: "Email inválido. Use um email válido." });
  }

  if (!password || password.length < 8) {
    return res.json({ Error: "A senha deve ter pelo menos 8 caracteres" });
  }

  const checkEmailSql = "SELECT * FROM fun_funcionario WHERE fun_email = ?";
  db.query(checkEmailSql, [email], (err, data) => {
    if (err) return res.json({ Error: "Erro ao verificar email", Details: err });
    if (data.length > 0) return res.json({ Error: "Email já cadastrado" });

    const salt = 10;
    bcrypt.hash(password.toString(), salt, (err, hash) => {
      if (err) return res.json({ Error: "Erro ao criptografar a senha" });

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      sendVerificationCode(email, code)
        .then(() => {
          const insertSql = `
            INSERT INTO fun_funcionario (fun_nome, fun_email, fun_senha, fun_role, fun_admin_approved, fun_codigo_verificacao, fun_verificado, fun_ativo)
            VALUES (?, ?, ?, ?, FALSE, ?, FALSE, FALSE)
          `;
          const values = [username, email, hash, "admin", code];
          db.query(insertSql, values, (err, result) => {
            if (err) {
              console.error("Erro ao inserir dados no banco:", err);
              return res.status(500).json({ Error: "Erro ao inserir dados", Details: err.message });
            }
            return res.json({ Status: "Código enviado para o e-mail!" });
          });
        })
        .catch((error) => {
          console.error("Erro no envio do e-mail:", error);
          return res.json({ Error: "Erro ao enviar código de verificação para o e-mail.", Details: error.message });
        });
    });
  });
};

export const verifyCode = (req, res) => {
  const { email, code } = req.body;

  const sql = "SELECT fun_codigo_verificacao FROM fun_funcionario WHERE fun_email = ?";
  db.query(sql, [email], (err, data) => {
    if (err || data.length === 0) return res.json({ Error: "E-mail não encontrado" });

    if (data[0].fun_codigo_verificacao === code) {
      const updateSql = `
        UPDATE fun_funcionario
        SET fun_verificado = TRUE, fun_codigo_verificacao = NULL
        WHERE fun_email = ?
      `;
      db.query(updateSql, [email], (err2) => {
        if (err2) return res.json({ Error: "Erro ao atualizar verificação" });
        return res.json({ Status: "Verificação concluída com sucesso!" });
      });
    } else {
      return res.json({ Error: "Código incorreto" });
    }
  });
};
