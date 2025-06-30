import express from "express";
import { getProducts, addProduct, updateProducts, deleteProducts, getProductsPagi, getProductsSearch } from "../controllers/produtos.js";

const router = express.Router();

router.get("/", getProducts);
router.get('/paginador', getProductsPagi)
router.get('/search', getProductsSearch)
router.post("/", addProduct);
router.put("/:pro_id", updateProducts);
router.delete("/:pro_id", deleteProducts);

export default router;
