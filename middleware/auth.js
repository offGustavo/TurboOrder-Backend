import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.token || req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Acesso negado. Token não fornecido." });
  }

  try {
    const verified = jwt.verify(token, "jwt-secret-key");
    req.user = verified; // { id, username, role }
    next();
  } catch (err) {
    return res.status(400).json({ error: "Token inválido." });
  }
};
