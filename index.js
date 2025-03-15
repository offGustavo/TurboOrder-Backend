import express from "express";
import cardapioRoutes from "./routes/cardapio.js";
import produtosRoutes from "./routes/produtos.js";
import cors from "cors";  
import bodyParser from "body-parser";

const app = express();
const PORT = 8800;

app.use(cors());  
app.use(bodyParser.json());

app.use("/cardapio", cardapioRoutes);
app.use("/produtos", produtosRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});