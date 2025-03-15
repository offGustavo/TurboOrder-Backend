import { db } from "../db.js";

export const getCardapioByDate = (req, res) => {
  const { data } = req.query;
  const q = "SELECT * FROM car_cardapio WHERE car_data = ?";

  db.query(q, [data], (err, data) => {
    if (err) return res.json(err);

    res.status(200).json(data[0] || null);
  });
};

export const addCardapio = (req, res) => {
  const q = "INSERT INTO car_cardapio (car_data) VALUES (?)";

  db.query(q, [req.body.car_data], (err, result) => {
    if (err) return res.json(err);

    res.status(200).json({ car_id: result.insertId, car_data: req.body.car_data });
  });
};

export const getItemsByCardapio = (req, res) => {
  const { car_fk } = req.query;
  const q = `
    SELECT d.*, p.pro_nome, p.pro_tipo 
    FROM dia_cardapioDia d
    JOIN pro_produto p ON d.pro_fk = p.pro_id
    WHERE d.car_fk = ?
  `;

  db.query(q, [car_fk], (err, data) => {
    if (err) return res.json(err);

    res.status(200).json(data);
  });
};

export const addItemToCardapio = (req, res) => {
  const q = "INSERT INTO dia_cardapioDia (pro_fk, car_fk) VALUES (?, ?)";

  db.query(q, [req.body.pro_fk, req.body.car_fk], (err, result) => {
    if (err) return res.json(err);

    res.status(200).json({ dia_id: result.insertId, ...req.body });
  });
};

export const removeItemFromCardapio = (req, res) => {
  const q = "DELETE FROM dia_cardapioDia WHERE dia_id = ?";

  db.query(q, [req.params.id], (err) => {
    if (err) return res.json(err);

    res.status(204).send();
  });
};
