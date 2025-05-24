import { db } from "../db.js";

export const getMounthSum = (req, res) => {
  const currentMonthQuery = `
      SELECT 
        SUM(ped_valor) AS totalMesAtual,
        COUNT(*) AS quantidadeMesAtual,
        AVG(ped_valor) AS mediaMesAtual
      FROM ped_pedido
      WHERE ped_data >= DATE_SUB(CURDATE(), INTERVAL MONTHNAME(CURDATE()) DAY)
    `;

  db.query(currentMonthQuery, (err2, result2) => {
    if (err1) {
      console.error('Erro ao calcular dados do mês atual:', err2);
      return res.status(500).json({ error: 'Erro ao calcular dados do mês atual.' });
    }

    return res.status(200).json({
      totalMesAtual: result2[0].totalMesAtual || 0,
      mediaMesAtual: result2[0].mediaMesAtual || 0
    });
  });
};

export const getWeekSum = (req, res) => {
  const currentWeekQuery = `
      SELECT 
        SUM(ped_valor) AS totalSemanaAtual,
        COUNT(*) AS quantidadeSemanaAtual,
        AVG(ped_valor) AS mediaSemanaAtual
      FROM ped_pedido
      WHERE ped_data >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)
    `;

  db.query(currentWeekQuery, (err, result) => {
    if (err) {
      console.error('Erro ao calcular dados da semana atual:', err);
      return res.status(500).json({ error: 'Erro ao calcular dados da semana atual.' });
    }

    return res.status(200).json({
      totalSemanaAtual: result[0].totalSemanaAtual || 0,
      mediaSemanaAtual: result[0].mediaSemanaAtual || 0,
    });
  });
};
