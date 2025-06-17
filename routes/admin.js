import express from "express";
import { forgotPassword, resetPassword } from "../controllers/passwordRecovery.js";
import { verifyEmail } from "../controllers/emailVerification.js";

const router = express.Router();

// Rota para recuperação de senha - esqueci minha senha
router.post("/forgot-password", forgotPassword);

// Rota para redefinir senha
router.post("/reset-password", resetPassword);

// Rota para verificação de email
router.post("/verify-email", verifyEmail);

export default router;
