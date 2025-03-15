import express from "express";
import { getProducts, addProduct, updateProducts, deleteProducts } from "../controllers/produtos.js";

const router = express.Router();

router.get("/", getProducts);
router.post("/", addProduct);
router.put("/:pro_id", updateProducts);
router.delete("/:pro_id", deleteProducts);

export default router;