import { db } from "../db.js";

export const verifyEmail = (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ error: "Email e código são obrigatórios" });
  }

  const sqlCheck = `
    SELECT fun_codigo_verificacao, fun_verificado
    FROM fun_funcionario
    WHERE fun_email = ? AND fun_ativo = TRUE
  `;

  db.query(sqlCheck, [email], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Erro no banco de dados", details: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Email não cadastrado" });
    }

    const user = results[0];

    if (user.fun_verificado) {
      return res.status(400).json({ error: "Email já verificado" });
    }

    if (user.fun_codigo_verificacao !== code) {
      return res.status(400).json({ error: "Código de verificação inválido" });
    }

    const sqlUpdate = `
      UPDATE fun_funcionario
      SET fun_verificado = TRUE, fun_codigo_verificacao = NULL
      WHERE fun_email = ?
    `;

    db.query(sqlUpdate, [email], (err2) => {
      if (err2) {
        return res.status(500).json({ error: "Erro ao atualizar verificação", details: err2.message });
      }

      return res.json({ message: "Email verificado com sucesso" });
    });
  });
};
