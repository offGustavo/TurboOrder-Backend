import { db } from "../db.js";

export const createPedido = (req, res) => {
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
    ped_desativado
  } = req.body;

  if (!cliente_fk || !funcionario_fk || !itens || !ped_status || !ped_valor || !ped_data || !ped_tipoPagamento) {
    return res.status(400).json({ error: "Todos os campos obrigatórios devem ser preenchidos." });
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
    carne02_fk
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

    const getOrdemQuery = `SELECT COUNT(*) AS ordem FROM ped_pedido WHERE ped_data = ?`;

    db.query(getOrdemQuery, [ped_data], (err3, result3) => {
      if (err3) {
        console.error("Erro ao calcular ped_ordem_dia:", err3);
        return res.status(500).json({ error: "Erro ao calcular ordem do pedido." });
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

        return res.status(201).json({
          message: "Pedido cadastrado com sucesso!",
          pedidoId: result2.insertId,
          ordem_dia: ped_ordem_dia
        });
      });
    });
  });
}

// TODO: Finalizar soma dos pedidos mensais aqui
export const getMounthSum = () => {
};

// Buscar todos os pedidos com status e informações do cliente
export const getPedidos = (req, res) => {

  // const q = `
  //       SELECT p.ped_id, p.ped_status, p.ped_valor, p.ped_data, p.ped_tipoPagamento,
  //              p.ped_desativado, p.ped_ordem_dia, p.ped_observacao,
  //              c.cli_nome, c.cli_sobrenome,
  //              f.fun_nome,
  //              i.*
  //       FROM ped_pedido p
  //       JOIN cli_cliente c ON p.cliente_fk = c.cli_id
  //       JOIN fun_funcionario f ON p.funcionario_fk = f.fun_id
  //       JOIN ite_itens i ON p.ite_fk = i.ite_id
  //   `;
  const q = `
        SELECT p.*,
               c.cli_nome, c.cli_sobrenome,
               f.fun_nome,
               i.*
        FROM ped_pedido p
        JOIN cli_cliente c ON p.cliente_fk = c.cli_id
        JOIN fun_funcionario f ON p.funcionario_fk = f.fun_id
        JOIN ite_itens i ON p.ite_fk = i.ite_id
        ORDER BY p.ped_data DESC
    `;

  db.query(q, (err, data) => {
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
        ped_horarioRetirada,
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

  const query = "UPDATE ped_pedido p SET p.ped_status = ? WHERE p.ped_id = ?";

  db.query(query, [status, id], (err, result) => {
    if (err) {
      console.error("Erro ao atualizar status do pedido:", err);
      return res.status(500).json({ error: "Erro ao atualizar status do pedido." });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Pedido não encontrado." });
    }

    return res.status(200).json({ message: "Status do pedido atualizado com sucesso!" });
  });
};
