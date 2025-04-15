// controllers/cardapio.js

import { db } from "../db.js";

// GET - Pega cardápio por data
export const getCardapioByDate = (req, res) => {
  const data = req.query.data;

  const q = `
    SELECT p.pro_id, p.pro_nome, p.pro_tipo
    FROM dia_cardapioDia d
    JOIN pro_produto p ON d.pro_fk = p.pro_id
    JOIN car_cardapio c ON d.car_fk = c.car_id
    WHERE c.car_data = ?
  `;

  db.query(q, [data], (err, result) => {
    if (err) {
      console.error("Erro ao buscar cardápio:", err);
      return res.status(500).json({ error: "Erro ao buscar cardápio." });
    }

    return res.status(200).json(result);
  });
};

// POST/PUT - Cria ou atualiza cardápio
export const saveOrUpdateCardapio = (req, res) => {
  const data = req.body.data;
  const produtos = req.body.produtos; // Array de objetos com pro_id e pro_tipo

  if (!data || !produtos || !Array.isArray(produtos)) {
    return res.status(400).json({ error: "Dados inválidos." });
  }

  const selectCardapio = "SELECT car_id FROM car_cardapio WHERE car_data = ?";
  db.query(selectCardapio, [data], (err, result) => {
    if (err) return res.status(500).json(err);

    const car_id = result[0]?.car_id;

    if (car_id) {
      // Atualiza: remove os antigos e insere os novos
      const deleteItens = "DELETE FROM dia_cardapioDia WHERE car_fk = ?";
      db.query(deleteItens, [car_id], (err) => {
        if (err) return res.status(500).json(err);

        const insertItens = "INSERT INTO dia_cardapioDia (pro_fk, car_fk) VALUES ?";
        const values = produtos.map((p) => [p.pro_id, car_id]);

        db.query(insertItens, [values], (err) => {
          if (err) return res.status(500).json(err);

          return res.status(200).json({ message: "Cardápio atualizado com sucesso!" });
        });
      });

    } else {
      // Cria novo cardápio
      const insertCardapio = "INSERT INTO car_cardapio (car_data) VALUES (?)";
      db.query(insertCardapio, [data], (err, result) => {
        if (err) return res.status(500).json(err);

        const novoCarId = result.insertId;
        const insertItens = "INSERT INTO dia_cardapioDia (pro_fk, car_fk) VALUES ?";
        const values = produtos.map((p) => [p.pro_id, novoCarId]);

        db.query(insertItens, [values], (err) => {
          if (err) return res.status(500).json(err);

          return res.status(200).json({ message: "Cardápio criado com sucesso!" });
        });
      });
    }
  });
};
