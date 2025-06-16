import { db } from "../db.js";
import jwt from "jsonwebtoken";

export const verifyUser = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        console.log("Você não está logado");
        return res.json({ Error: "Você não está logado" });
    } else {
        jwt.verify(token, "jwt-secret-key", (err, decoded) => {
            if (err) {
                console.log("Token inválido");
                return res.json({ Error: "Token inválido" });
            } else {
                console.log("Você está logado");
                req.username = decoded.username;
                req.role = decoded.role;
                req.foto = decoded.foto;
                next();
            }
        })
    }
}
