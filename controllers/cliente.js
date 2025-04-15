import { db } from "../db.js";

export const getClient = (_, res) => {
    const q = `
        SELECT 
            cli.cli_id, cli.cli_nome, cli.cli_sobrenome, 
            con.con_telefone, 
            end.end_cep AS cli_cep, end.end_rua AS cli_endereco, end.end_bairro AS cli_bairro, end.end_cidade AS cli_cidade,
            cli.cli_numero, cli.cli_complemento
        FROM cli_cliente cli
        JOIN con_contato con ON cli.contato_fk = con.con_id
        JOIN end_endereco end ON cli.endereco_fk = end.end_id
        WHERE cli.cli_ativo = TRUE
    `;

    db.query(q, (err, data) => {
        if (err) return res.json(err);
        console.log("Clientes retornados: ", data);
        return res.status(200).json(data);
    });
};

export const addClient = (req, res) => {
    const { clientInfo, address, con_telefone, empresa_fk } = req.body;

    const { cli_nome, cli_sobrenome, cli_numero, cli_complemento } = clientInfo || {};
    const { end_cep, end_cidade, end_bairro, end_rua } = address || {};

    if (!cli_nome || !cli_sobrenome || !cli_numero || !cli_complemento || !end_cep || !end_cidade || !end_bairro || !end_rua || !con_telefone) {
        return res.status(400).send("Todos os campos são obrigatórios!");
    }

    const insertEnderecoQuery = "INSERT INTO end_endereco (end_cep, end_cidade, end_bairro, end_rua) VALUES (?, ?, ?, ?)";
    db.query(insertEnderecoQuery, [end_cep, end_cidade, end_bairro, end_rua], (err, enderecoResult) => {
        if (err) {
            console.error("Erro ao inserir endereço:", err);
            return res.status(500).send("Erro ao cadastrar cliente. Tente novamente.");
        }

        const insertContatoQuery = "INSERT INTO con_contato (con_telefone) VALUES (?)";
        db.query(insertContatoQuery, [con_telefone], (err, contatoResult) => {
            if (err) {
                console.error("Erro ao inserir contato:", err);
                return res.status(500).send("Erro ao cadastrar cliente. Tente novamente.");
            }

            const enderecoId = enderecoResult.insertId;
            const contatoId = contatoResult.insertId;

            const insertClienteQuery = `
                INSERT INTO cli_cliente (cli_nome, cli_sobrenome, endereco_fk, contato_fk, empresa_fk, cli_numero, cli_complemento)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            db.query(insertClienteQuery, [cli_nome, cli_sobrenome, enderecoId, contatoId, empresa_fk, cli_numero, cli_complemento], (err, result) => {
                if (err) {
                    console.error("Erro ao inserir cliente:", err);
                    return res.status(500).send("Erro ao cadastrar cliente. Tente novamente.");
                }

                res.status(201).send("Cliente cadastrado com sucesso!");
            });
        });
    });
};

export const updateClient = (req, res) => {
    const { cli_nome, cli_sobrenome, con_telefone, end_cep, end_cidade, end_bairro, end_rua, cli_numero, cli_complemento, empresa_fk } = req.body;
    const { cli_id } = req.params;

    const getContatoId = `SELECT contato_fk, endereco_fk FROM cli_cliente WHERE cli_id = ?`;

    db.query(getContatoId, [cli_id], (err, results) => {
        if (err) return res.json(err);
        if (results.length === 0) return res.status(404).json("Cliente não encontrado");

        const contatoId = results[0].contato_fk;
        const enderecoId = results[0].endereco_fk;

        const updateContato = `UPDATE con_contato SET con_telefone = ? WHERE con_id = ?`;

        db.query(updateContato, [con_telefone, contatoId], (err2) => {
            if (err2) return res.json(err2);

            const updateEndereco = `UPDATE end_endereco SET end_cep = ?, end_cidade = ?, end_bairro = ?, end_rua = ? WHERE end_id = ?`;
            db.query(updateEndereco, [end_cep, end_cidade, end_bairro, end_rua, enderecoId], (err3) => {
                if (err3) return res.json(err3);

                const updateCliente = `
                    UPDATE cli_cliente 
                    SET cli_nome = ?, cli_sobrenome = ?, cli_numero = ?, cli_complemento = ?, empresa_fk = ?
                    WHERE cli_id = ?
                `;
                db.query(updateCliente, [cli_nome, cli_sobrenome, cli_numero, cli_complemento, empresa_fk, cli_id], (err4) => {
                    if (err4) return res.json(err4);
                    return res.status(200).json("Cliente atualizado com sucesso!");
                });
            });
        });
    });
};

export const deleteClient = (req, res) => {
    const { cli_id } = req.params;

    const q = "UPDATE cli_cliente SET cli_ativo = false WHERE cli_id = ?";

    db.query(q, [cli_id], (err) => {
        if (err) return res.json(err);
        return res.status(200).json("Cliente desativado com sucesso!");
    });
};

export const getClientByPhone = (req, res) => {
    const { telefone } = req.params;

    const q = `
        SELECT 
            cli.cli_id, cli.cli_nome, cli.cli_sobrenome, 
            con.con_telefone, 
            end.end_cep AS cli_cep, end.end_rua AS cli_endereco, end.end_bairro AS cli_bairro, end.end_cidade AS cli_cidade,
            cli.cli_numero, cli.cli_complemento
        FROM cli_cliente cli
        JOIN con_contato con ON cli.contato_fk = con.con_id
        JOIN end_endereco end ON cli.endereco_fk = end.end_id
        WHERE con.con_telefone = ? AND cli.cli_ativo = TRUE
    `;

    db.query(q, [telefone], (err, data) => {
        if (err) return res.json(err);
        if (data.length === 0) return res.status(404).json({ msg: "Cliente não encontrado" });

        return res.status(200).json(data[0]);
    });
};