import mysql from "mysql";

const db = mysql.createConnection({
  host: "localhost",
  user: "turboOrder",
  password: "turboOrder",
  database: "turboOrder"
});

db.connect((err) => {
  if (err) {
    console.error("Erro ao conectar no MySQL:", err);
    return;
  }
  console.log("Conexão com o MySQL bem-sucedida!");
});

export { db };
