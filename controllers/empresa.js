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
