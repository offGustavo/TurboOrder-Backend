import { db } from "../db.js";

export const createPedido = (req, res) => {
    const { cliente_fk, funcionario_fk, itens, ped_status, ped_valor, ped_data, ped_tipoPagamento } = req.body;

    if (!cliente_fk || !funcionario_fk || !itens || !ped_status || !ped_valor || !ped_data || !ped_tipoPagamento) {
        return res.status(400).json({ error: "Todos os campos são obrigatórios." });
    }

    const insertItensQuery = `
        INSERT INTO ite_itens (arroz_fk, feijao_fk, massa_fk, salada_fk, acompanhamento_fk, carne01_fk, carne02_fk)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const { arroz_fk, feijao_fk, massa_fk, salada_fk, acompanhamento_fk, carne01_fk, carne02_fk } = itens;

    db.query(insertItensQuery, [arroz_fk, feijao_fk, massa_fk, salada_fk, acompanhamento_fk, carne01_fk, carne02_fk], (err, result) => {
        if (err) {
            console.error("Erro ao inserir itens do pedido:", err);
            return res.status(500).json({ error: "Erro ao cadastrar itens do pedido." });
        }

        const ite_fk = result.insertId;

        const insertPedidoQuery = `
            INSERT INTO ped_pedido (cliente_fk, funcionario_fk, ite_fk, ped_status, ped_valor, ped_data, ped_tipoPagamento)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(insertPedidoQuery, [cliente_fk, funcionario_fk, ite_fk, ped_status, ped_valor, ped_data, ped_tipoPagamento], (err2, result2) => {
            if (err2) {
                console.error("Erro ao inserir pedido:", err2);
                return res.status(500).json({ error: "Erro ao cadastrar pedido." });
            }

            return res.status(201).json({ message: "Pedido cadastrado com sucesso!", pedidoId: result2.insertId });
        });
    });
};

export const getPedidos = (req, res) => {
    const { status, valor } = req.query;

    let q = `
        SELECT p.ped_id, p.ped_status, p.ped_valor, p.ped_data, p.ped_tipoPagamento,
               c.cli_nome, c.cli_sobrenome,
               f.fun_nome,
               i.*
        FROM ped_pedido p
        JOIN cli_cliente c ON p.cliente_fk = c.cli_id
        JOIN fun_funcionario f ON p.funcionario_fk = f.fun_id
        JOIN ite_itens i ON p.ite_fk = i.ite_id
    `;

    const conditions = [];
    const params = [];

    if (status !== undefined && status !== "") {
        conditions.push("p.ped_status = ?");
        params.push(status);
    }

    if (valor !== undefined && valor !== "") {
        conditions.push("p.ped_valor = ?");
        params.push(valor);
    }

    if (conditions.length > 0) {
        q += " WHERE " + conditions.join(" AND ");
    }

    q += " ORDER BY p.ped_data DESC";

    db.query(q, params, (err, data) => {
        if (err) {
            console.error("Erro ao buscar pedidos:", err);
            return res.status(500).json({ error: "Erro ao buscar pedidos." });
        }

        return res.status(200).json(data);
    });
};