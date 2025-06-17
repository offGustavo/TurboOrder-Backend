import express from "express";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import { getUserInfo, updateUserProfile } from "../controllers/user.js";

const router = express.Router();
export const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ Error: "Token não encontrado" });

  jwt.verify(token, process.env.JWT_SECRET || "jwt-secret-key", (err, decoded) => {
    if (err) return res.status(403).json({ Error: "Token inválido" });
    req.user = decoded; // decoded contém id, username, role
    next();
  });
};

// Config multer para upload da foto
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // pasta para salvar fotos
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});
const upload = multer({ storage });

router.get("/me", authenticateToken, getUserInfo);
router.put("/update-profile", authenticateToken, upload.single("foto"), updateUserProfile);

export default router;
