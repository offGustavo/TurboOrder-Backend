import express from "express";
import { getProducts, addProduct, updateProducts, deleteProducts, getAllProducts } from "../controllers/produtos.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/all", getAllProducts);
router.post("/", addProduct);
router.put("/:pro_id", updateProducts);
router.delete("/:pro_id", deleteProducts);

export default router;
