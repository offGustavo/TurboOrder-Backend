import mysql from "mysql";

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "senha",
  database: "turboorder"
});

db.connect((err) => {
  if (err) {
    console.error("Erro ao conectar no MySQL:", err);
    return;
  }
  console.log("Conexão com o MySQL bem-sucedida!");
});

export { db };