import { db } from "../db.js";

export const getProducts = (_, res) => {
  const q = "SELECT * FROM pro_produto WHERE pro_ativo = TRUE";

  db.query(q, (err, data) => {
    if (err) return res.json(err);

    return res.status(200).json(data);
  });
};

export const addProduct = (req, res) => {
  const q = "INSERT INTO pro_produto (pro_nome, pro_tipo, pro_ativo) VALUES (?, ?, true)";

  const values = [req.body.pro_nome, req.body.pro_tipo];

  db.query(q, values, (err, result) => {
    if (err) return res.json(err);

    const newProduct = {
      pro_id: result.insertId,
      pro_nome: req.body.pro_nome,
      pro_tipo: req.body.pro_tipo,
      pro_ativo: true
    };
    return res.status(200).json(newProduct);
  });
};


// FIX: Duplicate product in edit
//NOTE: Verificar se existe um produto ativo com o mesmo nome e o mesmo tipo e impedir o cadastro
export const updateProducts = (req, res) => {
  // Primeiro verifica se já existe um produto ativo com o mesmo nome e tipo
  const checkQuery = `
    SELECT pro_id FROM pro_produto 
    WHERE pro_nome = ? AND pro_tipo = ? AND pro_ativo = true AND pro_id != ?
  `;

  const checkValues = [
    req.body.pro_nome,
    req.body.pro_tipo,
    req.params.pro_id
  ];

  db.query(checkQuery, checkValues, (err, results) => {
    if (err) return res.json(err);

    // Se encontrou algum produto com mesmo nome e tipo, retorna erro
    if (results.length > 0) {
      return res.status(400).json({ error: "Já existe um produto ativo com este nome e tipo." });
    }

    // Se não encontrou, procede com a atualização
    const updateQuery = `
      UPDATE pro_produto 
      SET pro_nome = ?, pro_tipo = ? 
      WHERE pro_id = ?
    `;

    const updateValues = [
      req.body.pro_nome,
      req.body.pro_tipo,
      req.params.pro_id
    ];

    db.query(updateQuery, updateValues, (err) => {
      if (err) return res.json(err);
      return res.status(200).json("Produto atualizado com sucesso!");
    });
  });
};

export const deleteProducts = (req, res) => {
  const q = "UPDATE pro_produto SET pro_ativo = false WHERE pro_id = ?";

  db.query(q, [req.params.pro_id], (err) => {
    if (err) return res.json(err);

    return res.status(200).json("Produto deletado com sucesso!");
  });
};
