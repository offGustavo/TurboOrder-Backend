import { db } from "../db.js";

const filterOrder = (query) => {
  const { customerName, orderDate, status, valor } = query;

  let baseQuery = `
    SELECT p.ped_id, p.ped_status, p.ped_valor, p.ped_data, p.ped_tipoPagamento,
           p.ped_desativado, p.ped_ordem_dia,
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

  if (customerName) {
    conditions.push("(c.cli_nome LIKE ? OR c.cli_sobrenome LIKE ?)");
    params.push(`%${customerName}%`, `%${customerName}%`);
  }

  if (orderDate) {
    conditions.push("p.ped_data = ?");
    params.push(orderDate);
  }

  if (status) {
    conditions.push("p.ped_status = ?");
    params.push(status);
  }

  if (valor) {
    conditions.push("p.ped_valor = ?");
    params.push(valor);
  }

  if (conditions.length > 0) {
    baseQuery += " WHERE " + conditions.join(" AND ");
  }

  return { baseQuery, params };
};

export const createPedido = (req, res) => {
  const {
    cliente_fk,
    funcionario_fk,
    itens,
    ped_status,
    ped_valor,
    ped_data,
    ped_tipoPagamento,
    ped_observacao = null,
    ped_desativado = 0,
  } = req.body;

  if (
    !cliente_fk ||
    !funcionario_fk ||
    !itens ||
    !ped_status ||
    !ped_valor ||
    !ped_data ||
    !ped_tipoPagamento
  ) {
    return res
      .status(400)
      .json({ error: "Todos os campos obrigatórios devem ser preenchidos." });
  }

  const insertItensQuery = `
    INSERT INTO ite_itens (arroz_fk, feijao_fk, massa_fk, salada_fk, acompanhamento_fk, carne01_fk, carne02_fk)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  const {
    arroz_fk,
    feijao_fk,
    massa_fk,
    salada_fk,
    acompanhamento_fk,
    carne01_fk,
    carne02_fk,
  } = itens;

  db.query(
    insertItensQuery,
    [
      arroz_fk,
      feijao_fk,
      massa_fk,
      salada_fk,
      acompanhamento_fk,
      carne01_fk,
      carne02_fk,
    ],
    (err, result) => {
      if (err) {
        console.error("Erro ao inserir itens do pedido:", err);
        return res
          .status(500)
          .json({ error: "Erro ao cadastrar itens do pedido." });
      }

      const ite_fk = result.insertId;

      const getOrdemQuery = `
      SELECT COUNT(*) AS ordem FROM ped_pedido WHERE ped_data = ?
    `;

      db.query(getOrdemQuery, [ped_data], (err3, result3) => {
        if (err3) {
          console.error("Erro ao calcular ped_ordem_dia:", err3);
          return res
            .status(500)
            .json({ error: "Erro ao calcular ordem do pedido." });
        }

        const ped_ordem_dia = result3[0].ordem + 1;

        const insertPedidoQuery = `
        INSERT INTO ped_pedido (
          cliente_fk, funcionario_fk, ite_fk, ped_status, ped_valor, ped_data, ped_tipoPagamento,
          ped_observacao, ped_desativado, ped_ordem_dia
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

        db.query(
          insertPedidoQuery,
          [
            cliente_fk,
            funcionario_fk,
            ite_fk,
            ped_status,
            ped_valor,
            ped_data,
            ped_tipoPagamento,
            ped_observacao,
            ped_desativado,
            ped_ordem_dia,
          ],
          (err2, result2) => {
            if (err2) {
              console.error("Erro ao inserir pedido:", err2);
              return res
                .status(500)
                .json({ error: "Erro ao cadastrar pedido." });
            }

            return res.status(201).json({
              message: "Pedido cadastrado com sucesso!",
              pedidoId: result2.insertId,
              ordem_dia: ped_ordem_dia,
            });
          }
        );
      });
    }
  );
};

// TODO: Finalizar soma dos pedidos mensais aqui
export const getMounthSum = () => {};

export const getPedidos = (req, res) => {
  const { baseQuery, params } = filterOrder(req.query);

  db.query(baseQuery, params, (err, data) => {
    if (err) {
      console.error("Erro ao buscar pedidos:", err);
      return res.status(500).json({ error: "Erro ao buscar pedidos." });
    }

    return res.status(200).json(data);
  });
};

export const updatePedidoStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: "O novo status é obrigatório." });
  }

  const query = "UPDATE ped_pedido p SET p.ped_status = ? WHERE p.ped_id = ?";

  db.query(query, [status, id], (err, result) => {
    if (err) {
      console.error("Erro ao atualizar status do pedido:", err);
      return res
        .status(500)
        .json({ error: "Erro ao atualizar status do pedido." });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Pedido não encontrado." });
    }

    return res
      .status(200)
      .json({ message: "Status do pedido atualizado com sucesso!" });
  });
};
