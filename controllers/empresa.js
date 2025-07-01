import { db } from "../db.js";

export const createEmpresa = (req, res) => {
  const { empInfo, address, con_telefone, emp_funcionario_telefone } = req.body;

  console.log('Dados recebidos:', { empInfo, address, con_telefone, emp_funcionario_telefone });

  if (
    !empInfo?.emp_razaoSocial ||
    !empInfo?.emp_cnpj ||
    !address?.end_cep ||
    !address?.end_cidade ||
    !address?.end_bairro ||
    !address?.end_rua ||
    !con_telefone ||
    !emp_funcionario_telefone
  ) {
    console.error('Campos obrigatórios faltando:', {
      emp_razaoSocial: !empInfo?.emp_razaoSocial,
      emp_cnpj: !empInfo?.emp_cnpj,
      end_cep: !address?.end_cep,
      end_cidade: !address?.end_cidade,
      end_bairro: !address?.end_bairro,
      end_rua: !address?.end_rua,
      con_telefone: !con_telefone,
      emp_funcionario_telefone: !emp_funcionario_telefone
    });
    return res.status(400).json({ error: "Todos os campos obrigatórios devem ser preenchidos." });
  }

  // 1. Inserir endereço
  const insertEnderecoQuery = `
    INSERT INTO end_endereco (end_cep, end_cidade, end_bairro, end_rua)
    VALUES (?, ?, ?, ?)
  `;

  db.query(
    insertEnderecoQuery,
    [
      address.end_cep,
      address.end_cidade,
      address.end_bairro,
      address.end_rua
    ],
    (errEndereco, resultEndereco) => {
      if (errEndereco) {
        console.error("Erro ao inserir endereço:", errEndereco);
        return res.status(500).json({
          error: "Erro ao cadastrar endereço.",
          details: errEndereco.message
        });
      }

      const enderecoId = resultEndereco.insertId;
      console.log('Endereço inserido com ID:', enderecoId);

      // 2. Inserir contato (apenas telefone da empresa)
      const insertContatoQuery = `
        INSERT INTO con_contato (con_telefone)
        VALUES (?)
      `;

      db.query(
        insertContatoQuery,
        [con_telefone],
        (errContato, resultContato) => {
          if (errContato) {
            console.error("Erro ao inserir contato:", errContato);
            // Rollback do endereço inserido
            db.query('DELETE FROM end_endereco WHERE end_id = ?', [enderecoId]);
            return res.status(500).json({
              error: "Erro ao cadastrar contato.",
              details: errContato.message
            });
          }

          const contatoId = resultContato.insertId;
          console.log('Contato inserido com ID:', contatoId);

          // 3. Inserir empresa (incluindo telefone do funcionário)
          const insertEmpresaQuery = `
            INSERT INTO emp_empresa (
              emp_cnpj, endereco_fk, emp_inscricaoEstado, emp_razaoSocial,
              contato_fk, emp_numero, emp_complemento, emp_funcionario_telefone
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `;

          db.query(
            insertEmpresaQuery,
            [
              empInfo.emp_cnpj,
              enderecoId,
              empInfo.emp_inscricaoEstado || null,
              empInfo.emp_razaoSocial,
              contatoId,
              empInfo.emp_numero || null,
              empInfo.emp_complemento || null,
              emp_funcionario_telefone
            ],
            (errEmpresa, resultEmpresa) => {
              if (errEmpresa) {
                console.error("Erro ao inserir empresa:", errEmpresa);
                // Rollback dos dados inseridos
                db.query('DELETE FROM con_contato WHERE con_id = ?', [contatoId]);
                db.query('DELETE FROM end_endereco WHERE end_id = ?', [enderecoId]);
                return res.status(500).json({
                  error: "Erro ao cadastrar empresa.",
                  details: errEmpresa.message,
                  sqlMessage: errEmpresa.sqlMessage
                });
              }

              console.log('Empresa inserida com ID:', resultEmpresa.insertId);
              return res.status(201).json({
                message: "Empresa cadastrada com sucesso!",
                empresaId: resultEmpresa.insertId,
              });
            }
          );
        }
      );
    }
  );
};

export const getEmpresas = (req, res) => {
  const query = `
    SELECT 
      emp.*, 
      end.end_cep, end.end_cidade, end.end_bairro, end.end_rua,
      con.con_telefone AS con_telefone,
      emp.emp_funcionario_telefone AS emp_funcionario_telefone
    FROM emp_empresa emp
    JOIN end_endereco end ON emp.endereco_fk = end.end_id
    JOIN con_contato con ON emp.contato_fk = con.con_id 
    WHERE emp.emp_ativo = true
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Erro ao buscar empresas:", err);
      return res.status(500).json({ error: "Erro ao buscar empresas." });
    }

    return res.status(200).json(results);
  });
};

export const getEmpresaById = (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT 
      emp.*, 
      end.end_cep, end.end_cidade, end.end_bairro, end.end_rua,
      con.con_telefone
    FROM emp_empresa emp
    JOIN end_endereco end ON emp.endereco_fk = end.end_id
    JOIN con_contato con ON emp.contato_fk = con.con_id
    WHERE emp.emp_id = ?
  `;

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error("Erro ao buscar empresa:", err);
      return res.status(500).json({ error: "Erro ao buscar empresa." });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Empresa não encontrada." });
    }

    return res.status(200).json(results[0]);
  });
};

export const deleteEmpresa = (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: "ID da empresa não fornecido." });
  }

  const updateQuery = `
    UPDATE emp_empresa 
    SET emp_ativo = false 
    WHERE emp_id = ?
  `;

  db.query(updateQuery, [id], (err, result) => {
    if (err) {
      console.error("Erro ao desativar empresa:", err);
      return res.status(500).json({ error: "Erro ao desativar empresa." });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Empresa não encontrada." });
    }

    return res.status(200).json({ message: "Empresa desativada com sucesso." });
  });
};

export const editEmpresaById = (req, res) => {
  const { id } = req.params;
  const { empInfo, address, con_telefone, emp_funcionario_telefone } = req.body;

  if (!id) {
    return res.status(400).json({ error: "ID da empresa não fornecido." });
  }

  // 1. Primeiro atualiza o endereço
  const updateEnderecoQuery = `
    UPDATE end_endereco
    SET end_cep = ?, end_cidade = ?, end_bairro = ?, end_rua = ?
    WHERE end_id = (SELECT endereco_fk FROM emp_empresa WHERE emp_id = ?)
  `;

  db.query(
    updateEnderecoQuery,
    [
      address.end_cep,
      address.end_cidade,
      address.end_bairro,
      address.end_rua,
      id
    ],
    (errEndereco) => {
      if (errEndereco) {
        console.error("Erro ao atualizar endereço:", errEndereco);
        return res.status(500).json({
          error: "Erro ao atualizar endereço.",
          details: errEndereco.message
        });
      }

      // 2. Atualiza o contato (telefone da empresa)
      const updateContatoQuery = `
        UPDATE con_contato
        SET con_telefone = ?
        WHERE con_id = (SELECT contato_fk FROM emp_empresa WHERE emp_id = ?)
      `;

      db.query(
        updateContatoQuery,
        [con_telefone, id],
        (errContato) => {
          if (errContato) {
            console.error("Erro ao atualizar contato:", errContato);
            return res.status(500).json({
              error: "Erro ao atualizar contato.",
              details: errContato.message
            });
          }

          // 3. Finalmente atualiza a empresa
          const updateEmpresaQuery = `
            UPDATE emp_empresa
            SET 
              emp_cnpj = ?,
              emp_inscricaoEstado = ?,
              emp_razaoSocial = ?,
              emp_numero = ?,
              emp_complemento = ?,
              emp_funcionario_telefone = ?
            WHERE emp_id = ?
          `;

          db.query(
            updateEmpresaQuery,
            [
              empInfo.emp_cnpj,
              empInfo.emp_inscricaoEstado || null,
              empInfo.emp_razaoSocial,
              empInfo.emp_numero || null,
              empInfo.emp_complemento || null,
              emp_funcionario_telefone,
              id
            ],
            (errEmpresa) => {
              if (errEmpresa) {
                console.error("Erro ao atualizar empresa:", errEmpresa);
                return res.status(500).json({
                  error: "Erro ao atualizar empresa.",
                  details: errEmpresa.message
                });
              }

              return res.status(200).json({ message: "Empresa atualizada com sucesso!" });
            }
          );
        }
      );
    }
  );
};

export const getPedidosPorTelefoneFuncionario = (req, res) => {
  let { telefone } = req.params;

  console.log('Telefone recebido:', telefone); // Adicionado para depuração

  // Remove todos os caracteres não numéricos
  telefone = telefone.replace(/\D/g, '');

  if (!telefone) {
    return res.status(400).json({ error: "Telefone do funcionário não fornecido." });
  }

  // Restante do código permanece o mesmo...
  console.log('Telefone formatado:', telefone); // Adicionado para depuração
  // ...

  // Obter primeiro e último dia do mês atual
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Formatar datas para o formato MySQL (YYYY-MM-DD)
  const firstDayStr = firstDay.toISOString().split('T')[0];
  const lastDayStr = lastDay.toISOString().split('T')[0];

  let q = `
    SELECT 
      p.*,
      c.cli_nome, 
      c.cli_sobrenome,
      f.fun_nome,
      i.*,
      emp.emp_razaoSocial,
      emp.emp_id
    FROM ped_pedido p
    JOIN cli_cliente c ON p.cliente_fk = c.cli_id
    JOIN fun_funcionario f ON p.funcionario_fk = f.fun_id
    JOIN ite_itens i ON p.ite_fk = i.ite_id
    JOIN emp_empresa emp ON c.empresa_fk = emp.emp_id
    WHERE emp.emp_funcionario_telefone = ?
    AND p.ped_data BETWEEN ? AND ?
    ORDER BY p.ped_data DESC
  `;

  db.query(q, [telefone, firstDayStr, lastDayStr], (err, data) => {
    if (err) {
      console.error("Erro ao buscar pedidos por telefone do funcionário:", err);
      return res.status(500).json({
        error: "Erro ao buscar pedidos por telefone do funcionário.",
        details: err.message
      });
    }

    // Retorna tanto a contagem quanto os pedidos em si
    const response = {
      totalPedidos: data.length,
      pedidos: data
    };

    return res.status(200).json(response);
  });
};

export const getPedidosEmpresaMesAtual = (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: "ID da empresa não fornecido." });
  }

  // Obter primeiro e último dia do mês atual
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Formatar datas para o formato MySQL (YYYY-MM-DD)
  const firstDayStr = firstDay.toISOString().split('T')[0];
  const lastDayStr = lastDay.toISOString().split('T')[0];

  let q = `
    SELECT 
      p.*,
      c.cli_nome, 
      c.cli_sobrenome,
      f.fun_nome,
      i.*,
      emp.emp_razaoSocial
    FROM ped_pedido p
    JOIN cli_cliente c ON p.cliente_fk = c.cli_id
    JOIN fun_funcionario f ON p.funcionario_fk = f.fun_id
    JOIN ite_itens i ON p.ite_fk = i.ite_id
    JOIN emp_empresa emp ON c.empresa_fk = emp.emp_id
    WHERE emp.emp_id = ?
    AND p.ped_data BETWEEN ? AND ?
    ORDER BY p.ped_data DESC
  `;

  db.query(q, [id, firstDayStr, lastDayStr], (err, data) => {
    if (err) {
      console.error("Erro ao buscar pedidos da empresa:", err);
      return res.status(500).json({ error: "Erro ao buscar pedidos da empresa." });
    }

    // Retorna tanto a contagem quanto os pedidos em si
    const response = {
      totalPedidos: data.length,
      pedidos: data
    };

    return res.status(200).json(response);
  });
};
