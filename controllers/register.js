import { db } from "../db.js";
import bcrypt from "bcrypt";

export const addUser = (req, res) => {
    const sql = `INSERT INTO fun_funcionario (fun_nome, fun_email, fun_senha) VALUES (?, ?, ?)`;

    const salt = 10;

    bcrypt.hash(req.body.password.toString(), salt, (err, hash) => {
        if(err) return res.json({Error: "Erro ao criptografar a senha"});
        const values = [
            req.body.username,
            req.body.email,
            hash
        ];
        db.query(sql, values, (err, result) => {
            if(err) return res.json({Error: "Inserting data Error in server"});
            return res.json({Status: "Success"});
        });
    });
};
