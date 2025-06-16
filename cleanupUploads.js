import cron from "node-cron";
import fs from "fs";
import path from "path";

const uploadDir = path.join(process.cwd(), "uploads");

const deleteOldFiles = () => {
  if (!fs.existsSync(uploadDir)) {
    console.log("Pasta de uploads não encontrada:", uploadDir);
    return;
  }

  const files = fs.readdirSync(uploadDir);
  const now = Date.now();

  files.forEach((file) => {
    const filePath = path.join(uploadDir, file);
    try {
      const stats = fs.statSync(filePath);
      const ageInMs = now - stats.mtimeMs;
      const sevenDays = 7 * 24 * 60 * 60 * 1000; // 7 dias em ms

      if (ageInMs > sevenDays) {
        fs.unlinkSync(filePath);
        console.log(`Arquivo removido: ${file}`);
      }
    } catch (error) {
      console.error(`Erro ao processar o arquivo ${file}:`, error);
    }
  });
};

// Agenda para rodar todo dia à meia-noite (00:00)
cron.schedule("0 0 * * *", () => {
  console.log("Iniciando limpeza diária da pasta uploads...");
  deleteOldFiles();
});

export { deleteOldFiles };