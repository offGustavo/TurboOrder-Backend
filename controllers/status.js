import { db } from "../db.js";

// export const getMounthSum = (req, res) => {
//   const last30DaysQuery = `
//     SELECT 
//       SUM(ped_valor) AS totalUltimos30Dias,
//       COUNT(*) AS quantidadeUltimos30Dias,
//       AVG(ped_valor) AS mediaUltimos30Dias
//     FROM ped_pedido
//     WHERE ped_data >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
//   `;
//   const currentMonthQuery = `
//     SELECT 
//       SUM(ped_valor) AS totalMesAtual,
//       COUNT(*) AS quantidadeMesAtual,
//       AVG(ped_valor) AS mediaMesAtual
//     FROM ped_pedido
//     WHERE ped_data >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
//   `;
//   db.query(last30DaysQuery, (err1, result1) => {
//     if (err1) {
//       console.error('Erro ao calcular dados dos últimos 30 dias:', err1);
//       return res.status(500).json({ error: 'Erro ao calcular dados dos últimos 30 dias.' });
//     }
//     db.query(currentMonthQuery, (err2, result2) => {
//       if (err2) {
//         console.error('Erro ao calcular dados do mês atual:', err2);
//         return res.status(500).json({ error: 'Erro ao calcular dados do mês atual.' });
//       }
//       return res.status(200).json({
//         totalUltimos30Dias: result1[0].totalUltimos30Dias || 0,
//         mediaUltimos30Dias: result1[0].mediaUltimos30Dias || 0,
//         totalMesAtual: result2[0].totalMesAtual || 0,
//         mediaMesAtual: result2[0].mediaMesAtual || 0
//       });
//     });
//   });
// };

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
    if (err2) {
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

export const getDaySum = (req, res) => {
  const { dia_pedido } = req.params;

  const dayQuery = `
    SELECT 
      SUM(ped_valor) AS totalDia,
      COUNT(*) AS quantidadeDia,
      AVG(ped_valor) AS mediaDia
    FROM ped_pedido
    WHERE ped_data = ?;
  `;

  db.query(dayQuery, [dia_pedido], (err, result) => {
    if (err) {
      console.error('Erro ao calcular dados do dia atual:', err);
      return res.status(500).json({ error: 'Erro ao calcular dados do dia atual.' });
    }

    return res.status(200).json({
      totalDia: result[0].totalDia || 0,
      quantidadeDia: result[0].quantidadeDia || 0,
      mediaDia: result[0].mediaDia || 0,
    });
  });
};

export const getProductSales = (req, res) => {
  const query = `
    SELECT 
      p.pro_id,
      p.pro_nome,
      COUNT(*) AS quantidadeVendida
    FROM pro_produto p
    JOIN (
      SELECT arroz_fk AS pro_id FROM ite_itens 
      JOIN ped_pedido ON ped_pedido.ite_fk = ite_itens.ite_id
      WHERE ped_pedido.ped_status = 'Concluído' AND arroz_fk IS NOT NULL
      UNION ALL
      SELECT feijao_fk FROM ite_itens 
      JOIN ped_pedido ON ped_pedido.ite_fk = ite_itens.ite_id
      WHERE ped_pedido.ped_status = 'Concluído' AND feijao_fk IS NOT NULL
      UNION ALL
      SELECT massa_fk FROM ite_itens 
      JOIN ped_pedido ON ped_pedido.ite_fk = ite_itens.ite_id
      WHERE ped_pedido.ped_status = 'Concluído' AND massa_fk IS NOT NULL
      UNION ALL
      SELECT salada_fk FROM ite_itens 
      JOIN ped_pedido ON ped_pedido.ite_fk = ite_itens.ite_id
      WHERE ped_pedido.ped_status = 'Concluído' AND salada_fk IS NOT NULL
      UNION ALL
      SELECT acompanhamento_fk FROM ite_itens 
      JOIN ped_pedido ON ped_pedido.ite_fk = ite_itens.ite_id
      WHERE ped_pedido.ped_status = 'Concluído' AND acompanhamento_fk IS NOT NULL
      UNION ALL
      SELECT carne01_fk FROM ite_itens 
      JOIN ped_pedido ON ped_pedido.ite_fk = ite_itens.ite_id
      WHERE ped_pedido.ped_status = 'Concluído' AND carne01_fk IS NOT NULL
      UNION ALL
      SELECT carne02_fk FROM ite_itens 
      JOIN ped_pedido ON ped_pedido.ite_fk = ite_itens.ite_id
      WHERE ped_pedido.ped_status = 'Concluído' AND carne02_fk IS NOT NULL
    ) AS itens ON itens.pro_id = p.pro_id
    GROUP BY p.pro_id, p.pro_nome
    ORDER BY quantidadeVendida DESC
  `;

  db.query(query, (err, result) => {
    if (err) {
      console.error('Erro ao calcular quantidade de vendas por produto:', err);
      return res.status(500).json({ error: 'Erro ao calcular quantidade de vendas por produto.' });
    }

    return res.status(200).json(result);
  });
};

export const getProductSalesById = (req, res) => {
  const productId = req.params.id;

  const query = `
    SELECT 
      p.pro_id,
      p.pro_nome,
      COUNT(*) AS quantidadeVendida
    FROM pro_produto p
    JOIN (
      SELECT arroz_fk AS pro_id FROM ite_itens 
      JOIN ped_pedido ON ped_pedido.ite_fk = ite_itens.ite_id
      WHERE ped_pedido.ped_status = 'Concluído' AND arroz_fk = ?
      UNION ALL
      SELECT feijao_fk FROM ite_itens 
      JOIN ped_pedido ON ped_pedido.ite_fk = ite_itens.ite_id
      WHERE ped_pedido.ped_status = 'Concluído' AND feijao_fk = ?
      UNION ALL
      SELECT massa_fk FROM ite_itens 
      JOIN ped_pedido ON ped_pedido.ite_fk = ite_itens.ite_id
      WHERE ped_pedido.ped_status = 'Concluído' AND massa_fk = ?
      UNION ALL
      SELECT salada_fk FROM ite_itens 
      JOIN ped_pedido ON ped_pedido.ite_fk = ite_itens.ite_id
      WHERE ped_pedido.ped_status = 'Concluído' AND salada_fk = ?
      UNION ALL
      SELECT acompanhamento_fk FROM ite_itens 
      JOIN ped_pedido ON ped_pedido.ite_fk = ite_itens.ite_id
      WHERE ped_pedido.ped_status = 'Concluído' AND acompanhamento_fk = ?
      UNION ALL
      SELECT carne01_fk FROM ite_itens 
      JOIN ped_pedido ON ped_pedido.ite_fk = ite_itens.ite_id
      WHERE ped_pedido.ped_status = 'Concluído' AND carne01_fk = ?
      UNION ALL
      SELECT carne02_fk FROM ite_itens 
      JOIN ped_pedido ON ped_pedido.ite_fk = ite_itens.ite_id
      WHERE ped_pedido.ped_status = 'Concluído' AND carne02_fk = ?
    ) AS itens ON itens.pro_id = p.pro_id
    WHERE p.pro_id = ?
    GROUP BY p.pro_id, p.pro_nome
  `;

  const params = [productId, productId, productId, productId, productId, productId, productId, productId];

  db.query(query, params, (err, result) => {
    if (err) {
      console.error('Erro ao calcular quantidade de vendas do produto:', err);
      return res.status(500).json({ error: 'Erro ao calcular quantidade de vendas do produto.' });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: 'Produto não encontrado ou sem vendas concluídas.' });
    }

    return res.status(200).json(result[0]);
  });
};
