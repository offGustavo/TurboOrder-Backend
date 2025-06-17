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
    itens,
    ped_status,
    ped_valor,
    ped_data,
    ped_tipoPagamento,
    ped_horarioRetirada,
    ped_observacao,
    ped_desativado = 0
  } = req.body;

  const funcionario_fk = req.user.fun_id;
  const admin_owner_id = req.adminId;

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

  db.query(insertItensQuery, [
    arroz_fk || null,
    feijao_fk || null,
    massa_fk || null,
    salada_fk || null,
    acompanhamento_fk || null,
    carne01_fk || null,
    carne02_fk || null
  ], (err, result) => {
    if (err) {
      console.error("Erro ao inserir itens do pedido:", err);
      return res.status(500).json({ error: "Erro ao cadastrar itens do pedido." });
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
      const horarioRetirada = ped_horarioRetirada && ped_horarioRetirada.trim() !== '' ? ped_horarioRetirada : null;

      const insertPedidoQuery = `
        INSERT INTO ped_pedido (
          cliente_fk, funcionario_fk, ite_fk, ped_status, ped_valor, ped_data,
          ped_tipoPagamento, ped_observacao, ped_desativado, ped_ordem_dia, ped_horarioRetirada
        )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      db.query(insertPedidoQuery, [
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
        horarioRetirada
      ], (err2, result2) => {
        if (err2) {
          console.error("Erro ao inserir pedido:", err2);
          return res.status(500).json({ error: "Erro ao cadastrar pedido." });
        }
        // Update ped_pedido with admin_owner_id
        const updateAdminOwnerSql = "UPDATE ped_pedido SET admin_owner_id = ? WHERE ped_id = ?";
        db.query(updateAdminOwnerSql, [admin_owner_id, result2.insertId], (err3) => {
          if (err3) {
            console.error("Erro ao atualizar admin_owner_id do pedido:", err3);
            return res.status(500).json({ error: "Erro ao atualizar pedido." });
          }
          return res.status(201).json({
            message: "Pedido cadastrado com sucesso!",
            pedidoId: result2.insertId,
            ordem_dia: ped_ordem_dia,
          });
        });
      });
    });
  });
};

export const getFiltredPedidos = (req, res) => {

  let { baseQuery, params } = filterOrder(req.query || {});

  baseQuery += " AND (p.funcionario_fk = ? OR p.admin_owner_id = ?)";
  params.push(req.user.fun_id, req.adminId);

  db.query(baseQuery, params, (err, data) => {
    if (err) {
      console.error("Erro ao buscar pedidos:", err);
      return res.status(500).json({ error: "Erro ao buscar pedidos." });
    }

    return res.status(200).json(data);
  });
};

export const getPedidos = (req, res) => {

  let q = `
        SELECT p.*,
               c.cli_nome, c.cli_sobrenome,
               f.fun_nome,
               i.*
        FROM ped_pedido p
        JOIN cli_cliente c ON p.cliente_fk = c.cli_id
        JOIN fun_funcionario f ON p.funcionario_fk = f.fun_id
        JOIN ite_itens i ON p.ite_fk = i.ite_id
        WHERE p.funcionario_fk = ? OR p.admin_owner_id = ?
    `;

  db.query(q, [req.user.fun_id, req.adminId], (err, data) => {
    if (err) {
      console.error("Erro ao buscar pedidos:", err);
      return res.status(500).json({ error: "Erro ao buscar pedidos." });
    }

    return res.status(200).json(data);
  });
};

export const editPedidos = (req, res) => {

  const { id } = req.params;
  const {
    cliente_fk,
    funcionario_fk,
    itens,
    ped_status,
    ped_valor,
    ped_data,
    ped_tipoPagamento,
    ped_horarioRetirada,
    ped_observacao,
    ped_desativado = 0
  } = req.body;

  if (!cliente_fk || !funcionario_fk || !itens || !ped_status || !ped_valor || !ped_data || !ped_tipoPagamento) {
    return res.status(400).json({ error: "Todos os campos obrigatórios devem ser preenchidos." });
  }

  const getIteFkQuery = "SELECT ite_fk FROM ped_pedido WHERE ped_id = ?";
  db.query(getIteFkQuery, [id], (err, result) => {
    if (err) {
      console.error("Erro ao buscar itens do pedido:", err);
      return res.status(500).json({ error: "Erro ao buscar itens do pedido." });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: "Pedido não encontrado." });
    }

    const ite_fk = result[0].ite_fk;

    const {
      arroz_fk,
      feijao_fk,
      massa_fk,
      salada_fk,
      acompanhamento_fk,
      carne01_fk,
      carne02_fk
    } = {
      arroz_fk: itens.arroz_fk === '' ? null : itens.arroz_fk,
      feijao_fk: itens.feijao_fk === '' ? null : itens.feijao_fk,
      massa_fk: itens.massa_fk === '' ? null : itens.massa_fk,
      salada_fk: itens.salada_fk === '' ? null : itens.salada_fk,
      acompanhamento_fk: itens.acompanhamento_fk === '' ? null : itens.acompanhamento_fk,
      carne01_fk: itens.carne01_fk === '' ? null : itens.carne01_fk,
      carne02_fk: itens.carne02_fk === '' ? null : itens.carne02_fk,
    };

    const updateItensQuery = `
      UPDATE ite_itens
      SET arroz_fk = ?, feijao_fk = ?, massa_fk = ?, salada_fk = ?, acompanhamento_fk = ?, carne01_fk = ?, carne02_fk = ?
      WHERE ite_id = ?
    `;

    db.query(updateItensQuery, [arroz_fk, feijao_fk, massa_fk, salada_fk, acompanhamento_fk, carne01_fk, carne02_fk, ite_fk], (err2) => {
      if (err2) {
        console.error("Erro ao atualizar itens do pedido:", err2);
        return res.status(500).json({ error: "Erro ao atualizar itens do pedido." });
      }

      const horarioRetiradaTratado = ped_horarioRetirada === '' ? null : ped_horarioRetirada;

      const updatePedidoQuery = `
        UPDATE ped_pedido
        SET cliente_fk = ?, funcionario_fk = ?, ped_status = ?, ped_valor = ?, ped_data = ?, ped_tipoPagamento = ?,
            ped_observacao = ?, ped_desativado = ?, ped_horarioRetirada = ?
        WHERE ped_id = ?
      `;

      db.query(updatePedidoQuery, [
        cliente_fk,
        funcionario_fk,
        ped_status,
        ped_valor,
        ped_data,
        ped_tipoPagamento,
        ped_observacao,
        ped_desativado,
        horarioRetiradaTratado,
        id
      ], (err3, result3) => {
        if (err3) {
          console.error("Erro ao atualizar pedido:", err3);
          return res.status(500).json({ error: "Erro ao atualizar pedido." });
        }

        if (result3.affectedRows === 0) {
          return res.status(404).json({ error: "Pedido não encontrado para atualização." });
        }

        return res.status(200).json({ message: "Pedido atualizado com sucesso!" });
      });
    });
  });
};

export const updatePedidoStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: "O novo status é obrigatório." });
  }

  const selectQuery = "SELECT ped_status, ped_updated_at FROM ped_pedido WHERE ped_id = ?";

  db.query(selectQuery, [id], (selectErr, results) => {
    if (selectErr) {
      console.error("Erro ao buscar pedido:", selectErr);
      return res.status(500).json({ error: "Erro ao buscar pedido." });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Pedido não encontrado." });
    }

    const { ped_status: currentStatus, ped_updated_at } = results[0];
    const isReactivating = (currentStatus === 'Concluído' || currentStatus === 'Cancelado') && status === 'Em Andamento';
    const isConcludedChange = currentStatus === 'Concluído' && status !== 'Concluído';

    const updatedAt = new Date(ped_updated_at);
    const now = new Date();
    const diffMinutes = (now - updatedAt) / (1000 * 60);

    if ((isReactivating || isConcludedChange) && diffMinutes > 5) {
      return res.status(403).json({ error: "Não é permitido modificar esse pedido após 5 minutos da conclusão/cancelamento." });
    }

    const updateQuery = "UPDATE ped_pedido SET ped_status = ?, ped_updated_at = CURRENT_TIMESTAMP WHERE ped_id = ?";

    db.query(updateQuery, [status, id], (updateErr, result) => {
      if (updateErr) {
        console.error("Erro ao atualizar status do pedido:", updateErr);
        return res.status(500).json({ error: "Erro ao atualizar status do pedido." });
      }

      return res.status(200).json({ message: "Status do pedido atualizado com sucesso!" });
    });
  });
};
