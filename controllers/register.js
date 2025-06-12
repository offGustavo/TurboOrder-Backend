import { db } from "../db.js";
import bcrypt from "bcrypt";

export const addUser = (req, res) => {
    const { username, email, password } = req.body;

    const emailRegex = /^[A-Z0-9._%+-]+@(gmail\.com|googlemail\.com|hotmail.com)$/;
    if (!emailRegex.test(email)) {
        return res.json({ Error: "Email inválido. Use um email do Gmail válido." });
    }

    if (!password || password.length < 8) {
        return res.json({ Error: "A senha deve ter pelo menos 8 caracteres" });
    }

    const hasSequence = (str) => {
        for (let i = 0; i < str.length - 2; i++) {
            const charCode1 = str.charCodeAt(i);
            const charCode2 = str.charCodeAt(i + 1);
            const charCode3 = str.charCodeAt(i + 2);
            if ((charCode2 === charCode1 + 1 && charCode3 === charCode2 + 1) ||
                (charCode2 === charCode1 - 1 && charCode3 === charCode2 - 1)) {
                return true;
            }
        }
        return false;
    };

    if (hasSequence(password)) {
        return res.json({ Error: "A senha não pode conter sequências de caracteres consecutivos" });
    }

    const checkEmailSql = "SELECT * FROM fun_funcionario WHERE fun_email = ?";
    db.query(checkEmailSql, [email], (err, data) => {
        if (err) {
            return res.json({ Error: "Erro ao verificar email", Details: err });
        }
        if (data.length > 0) {
            return res.json({ Error: "Email já cadastrado" });
        }

        const insertSql = `INSERT INTO fun_funcionario (fun_nome, fun_email, fun_senha, fun_role) VALUES (?, ?, ?, ?)`;
        const salt = 10;

        bcrypt.hash(password.toString(), salt, (err, hash) => {
            if (err) return res.json({ Error: "Erro ao criptografar a senha" });
            const values = [username, email, hash, 'admin'];
            db.query(insertSql, values, (err, result) => {
                if (err) return res.json({ Error: "Erro ao inserir dados no servidor" });
                return res.json({ Status: "Success" });
            });
        });
    });
};
