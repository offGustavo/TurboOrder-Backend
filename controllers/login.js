import { response } from "express";
import { db } from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

export const loginUser = (req, res) => {
const sql = "SELECT fun_nome, fun_senha, fun_role FROM fun_funcionario WHERE fun_email = ?";

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
                const username = data[0].fun_nome;
                const role = data[0].fun_role;
                const token = jwt.sign({username, role}, "jwt-secret-key", {expiresIn: "1d"});
                res.cookie("token", token);
                return res.json({ Status: "Success"});
            } else {
                return res.json({ Error: "Senha inválida" });
            }
        });
    } else {
        return res.json({ Error: "Email inválido" });
    }
});
};
