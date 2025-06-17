import { db } from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const loginUser = (req, res) => {
  const sql = "SELECT fun_id, fun_nome, fun_senha, fun_role, fun_foto FROM fun_funcionario WHERE fun_email = ?";

  db.query(sql, [req.body.email], (err, data) => {
    if (err) {
      return res.json({ Error: "Erro ao fazer login", Details: err });
    }

    if (data.length > 0) {
      const hashedPassword = data[0].fun_senha;

      bcrypt.compare(req.body.password.toString(), hashedPassword, (err, result) => {
        if (err) {
          console.log("Erro na comparação de senha:", err);
          return res.json({ Error: "Erro na comparação de senha", Details: err });
        }

        if (result) {
          const { fun_id: id, fun_nome: username, fun_role: role, fun_foto: foto } = data[0];
          const token = jwt.sign({ id, username, role, foto }, "jwt-secret-key", { expiresIn: "1d" });
          // Remove cookie setting, return token in response
          return res.json({ Status: "Success", token });
        } else {
          return res.json({ Error: "Senha inválida" });
        }
      });
    } else {
      return res.json({ Error: "Email inválido" });
    }
  });
};