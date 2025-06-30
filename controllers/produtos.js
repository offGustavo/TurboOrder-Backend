import { db } from "../db.js";

export const getProductsPagi = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const filter = req.query.filter || '';
  const limit = 25;
  const offset = (page - 1) * limit;

  let q = `
    SELECT * FROM pro_produto 
    WHERE pro_ativo = TRUE
  `;

  let countQuery = "SELECT COUNT(*) as total FROM pro_produto WHERE pro_ativo = TRUE";

  // Adiciona filtro se existir
  if (filter) {
    q += ` AND pro_tipo = '${filter}'`;
    countQuery += ` AND pro_tipo = '${filter}'`;
  }

  q += ` LIMIT ? OFFSET ?`;

  // Primeiro obtemos o total de registros
  db.query(countQuery, (err, countData) => {
    if (err) return res.json(err);

    const total = countData[0].total;
    const totalPages = Math.ceil(total / limit);

    // Depois obtemos os dados paginados
    db.query(q, [limit, offset], (err, data) => {
      if (err) return res.json(err);

      return res.status(200).json({
        data,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit
        }
      });
    });
  });
};

export const getProducts = (_, res) => {
  const q = "SELECT * FROM pro_produto WHERE pro_ativo = TRUE";

  db.query(q, (err, data) => {
    if (err) return res.json(err);

    return res.status(200).json(data);
  });
};

export const getProductsSearch = (req, res) => {
  const { term } = req.query;

  if (!term) {
    return res.status(400).json({ error: "Termo de pesquisa não fornecido" });
  }

  const q = "SELECT * FROM pro_produto WHERE pro_ativo = TRUE AND pro_nome LIKE ?";
  const searchTerm = `%${term}%`;

  db.query(q, [searchTerm], (err, data) => {
    if (err) return res.json(err);

    return res.status(200).json(data);
  });
};

export const addProduct = (req, res) => {
  const checkQuery = `
    SELECT pro_id FROM pro_produto 
    WHERE pro_nome = ? AND pro_tipo = ? AND pro_ativo = true
  `;

  const checkValues = [
    req.body.pro_nome,
    req.body.pro_tipo
  ];

  db.query(checkQuery, checkValues, (err, results) => {
    if (err) return res.json(err);

    if (results.length > 0) {
      return res.status(400).json({ error: "Este item já foi cadastrado." });
    }

    const insertQuery = `
      INSERT INTO pro_produto (pro_nome, pro_tipo, pro_ativo) 
      VALUES (?, ?, true)
    `;

    const insertValues = [req.body.pro_nome, req.body.pro_tipo];

    db.query(insertQuery, insertValues, (err, result) => {
      if (err) return res.json(err);

      const newProduct = {
        pro_id: result.insertId,
        pro_nome: req.body.pro_nome,
        pro_tipo: req.body.pro_tipo,
        pro_ativo: true
      };
      return res.status(200).json(newProduct);
    });
  });
};;


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
