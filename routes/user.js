import express from "express";
import multer from "multer";
import path from "path";
import { getUserInfo, updateUserProfile } from "../controllers/user.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

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

router.get("/me", verifyToken, getUserInfo);
router.put("/update-profile", verifyToken, upload.single("foto"), updateUserProfile);

export default router;
