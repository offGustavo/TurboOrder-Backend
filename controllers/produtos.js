import { db } from "../db.js";

export const getProducts = (req, res) => {
   
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

   
    const q = `
        SELECT * FROM pro_produto 
        WHERE pro_ativo = TRUE 
        LIMIT ? OFFSET ?
    `;

   
    const countQuery = "SELECT COUNT(*) AS total FROM pro_produto WHERE pro_ativo = TRUE";

    db.query(q, [limit, offset], (err, data) => {
        if (err) return res.status(500).json(err);

        db.query(countQuery, (countErr, countResult) => {
            if (countErr) return res.status(500).json(countErr);

            const totalItems = countResult[0].total;
            const totalPages = Math.ceil(totalItems / limit);

            return res.status(200).json({
                data,
                pagination: {
                    totalItems,
                    totalPages,
                    currentPage: page,
                    itemsPerPage: limit,
                },
            });
        });
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

export const updateProducts = (req, res) => {
    const q = "UPDATE pro_produto SET pro_nome = ?, pro_tipo = ? WHERE pro_id = ?";

    const values = [
        req.body.pro_nome,
        req.body.pro_tipo,
        req.params.pro_id
    ];

    db.query(q, values, (err) => {
        if (err) return res.json(err);

        return res.status(200).json("Produto atualizado com sucesso!");
    });
};


export const deleteProducts = (req, res) => {
    const q = "UPDATE pro_produto SET pro_ativo = false WHERE pro_id = ?";

    db.query(q, [req.params.pro_id], (err) => {
        if (err) return res.json(err);

        return res.status(200).json("Produto deletado com sucesso!");
    });
};
