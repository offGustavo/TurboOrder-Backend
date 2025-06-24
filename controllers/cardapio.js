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
  const produtos = req.body.produtos;

  if (!data || !produtos || !Array.isArray(produtos)) {
    return res.status(400).json({ error: "Dados inválidos." });
  }

  const agora = new Date();

  console.log("Data:", data);
  const [ano, mes, dia] = data.split('-').map(Number);
  //NOTE: Corrige o Fuso
  const dataCardapio = new Date(ano, mes - 1, dia);

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  dataCardapio.setHours(0, 0, 0, 0);

  console.log("Hoje (zerado):", hoje.toISOString());
  console.log("Data do cardápio (zerado):", dataCardapio.toISOString());
  const dataSomente = new Date(dataCardapio);
  // dataSomente.setHours(0, 0, 0, 0);
  hoje.setHours(0, 0, 0, 0); // Zera hora para comparar apenas a data
  console.log("data: ")
  console.log(data)
  console.log("hoje: ")
  console.log(hoje)
  console.log("dataCardapio")
  dataCardapio.setHours(0, 0, 0, 0); // Zera hora para comparar apenas a data
  console.log(dataCardapio)

  // TODO: tanformar isso em uma variavel que pode ser controlado pelo usuário
  const HORA_LIMITE = 18;

  if (dataCardapio < hoje) {
    console.log("Bloqueado: tentativa de alteração de data passada.");
    return res.status(403).json({ error: "Não é permitido alterar cardápios de dias passados." });
  }



  const limiteEdicao = new Date(dataCardapio);
  limiteEdicao.setHours(HORA_LIMITE, 0, 0, 0);

  if (dataSomente.getTime() === hoje.getTime() && agora > limiteEdicao) {
    return res.status(403).json({
      error: `O cardápio do dia só pode ser alterado até às ${String(HORA_LIMITE).padStart(2, '0')}:00.`,
    });
  }

  const selectCardapio = "SELECT car_id FROM car_cardapio WHERE car_data = ?";
  db.query(selectCardapio, [data], (err, result) => {
    if (err) return res.status(500).json(err);

    const car_id = result[0]?.car_id;

    if (car_id) {
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
