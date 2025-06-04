import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

import homeRoutes from "./routes/home.js"
import cardapioRoutes from "./routes/cardapio.js";
import produtosRoutes from "./routes/produtos.js";
import clienteRoutes from "./routes/cliente.js";
import pedidoRoutes from "./routes/pedido.js";
import statusRoutes from "./routes/status.js";
import registerRoutes from "./routes/register.js";
import loginRoutes from "./routes/login.js"

const app = express();
const PORT = 8800;

app.use(cors({
  origin: ["http://localhost:3000"],
  methods: ["POST", "GET"],
  credentials: true
}));

app.use(bodyParser.json());
app.use(cookieParser());

app.use('/', homeRoutes);
app.use("/clientes", clienteRoutes);
app.use("/cardapio", cardapioRoutes);
app.use("/produtos", produtosRoutes);
app.use("/pedidos", pedidoRoutes);
app.use('/status', statusRoutes);
app.use('/cadastro', registerRoutes);
app.use('/login', loginRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
