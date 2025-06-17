import { db } from "../db.js";

export const createEmpresa = (req, res) => {
  const { empInfo, address, con_telefone } = req.body;

  if (
    !empInfo?.emp_razaoSocial ||
    !empInfo?.emp_cnpj ||
    !address?.end_cep ||
    !address?.end_cidade ||
    !address?.end_bairro ||
    !address?.end_rua ||
    !con_telefone
  ) {
    return res
      .status(400)
      .json({ error: "Todos os campos obrigatórios devem ser preenchidos." });
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
        return res.status(500).json({ error: "Erro ao cadastrar endereço." });
      }

      const enderecoId = resultEndereco.insertId;

      // 2. Inserir contato
      const insertContatoQuery = `
        INSERT INTO con_contato (con_telefone)
        VALUES (?)
      `;

      db.query(insertContatoQuery, [con_telefone], (errContato, resultContato) => {
        if (errContato) {
          console.error("Erro ao inserir contato:", errContato);
          return res.status(500).json({ error: "Erro ao cadastrar contato." });
        }

        const contatoId = resultContato.insertId;

        // 3. Inserir empresa
        const insertEmpresaQuery = `
          INSERT INTO emp_empresa (
            emp_cnpj, endereco_fk, emp_inscricaoEstado, emp_razaoSocial,
            contato_fk, emp_numero, emp_complemento
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
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
            empInfo.emp_complemento || null
          ],
          (errEmpresa, resultEmpresa) => {
            if (errEmpresa) {
              console.error("Erro ao inserir empresa:", errEmpresa);
              return res.status(500).json({ error: "Erro ao cadastrar empresa." });
            }

            return res.status(201).json({
              message: "Empresa cadastrada com sucesso!",
              empresaId: resultEmpresa.insertId,
            });
          }
        );
      });
    }
  );
};

export const getEmpresas = (req, res) => {
  const query = `
    SELECT 
      emp.*, 
      end.end_cep, end.end_cidade, end.end_bairro, end.end_rua,
      con.con_telefone
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

export const editEmpresaById = (req, res) => {

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
