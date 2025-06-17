import { db } from "../db.js";

export const getDailyRevenue = (req, res) => {
  const query = `
    SELECT DATE(ped_data) AS dia, SUM(ped_valor) AS receita
    FROM ped_pedido
    WHERE ped_desativado = 0
    GROUP BY DATE(ped_data)
    ORDER BY DATE(ped_data) ASC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Erro ao buscar receita diária:", err);
      return res.status(500).json({ error: "Erro ao buscar receita diária." });
    }
    return res.status(200).json(results);
  });
};

export const getWeeklyRevenue = (req, res) => {
  const query = `
    SELECT YEAR(ped_data) AS ano, WEEK(ped_data, 1) AS semana, SUM(ped_valor) AS receita
    FROM ped_pedido
    WHERE ped_desativado = 0
    GROUP BY YEAR(ped_data), WEEK(ped_data, 1)
    ORDER BY YEAR(ped_data), WEEK(ped_data, 1) ASC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Erro ao buscar receita semanal:", err);
      return res.status(500).json({ error: "Erro ao buscar receita semanal." });
    }
    return res.status(200).json(results);
  });
};

export const getMonthlyRevenue = (req, res) => {
  const query = `
    SELECT YEAR(ped_data) AS ano, MONTH(ped_data) AS mes, SUM(ped_valor) AS receita
    FROM ped_pedido
    WHERE ped_desativado = 0
    GROUP BY YEAR(ped_data), MONTH(ped_data)
    ORDER BY YEAR(ped_data), MONTH(ped_data) ASC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Erro ao buscar receita mensal:", err);
      return res.status(500).json({ error: "Erro ao buscar receita mensal." });
    }
    return res.status(200).json(results);
  });
};
