SELECT 
    p.ped_id,
    p.ped_status,
    p.ped_valor,
    p.ped_data,
    p.ped_tipoPagamento,
    p.ped_horarioRetirada,
    p.ped_observacao,
    p.ped_desativado,
    p.ped_ordem_dia,

    -- Dados do cliente
    c.cli_id,
    c.cli_nome,
    c.cli_sobrenome,
    con.con_telefone,

    -- Dados do funcionário
    f.fun_id,
    f.fun_nome,

    -- Itens do pedido
    i.ite_id,
    i.arroz_fk,
    i.feijao_fk,
    i.massa_fk,
    i.salada_fk,
    i.acompanhamento_fk,
    i.carne01_fk,
    i.carne02_fk

FROM ped_pedido p
JOIN cli_cliente c ON p.cliente_fk = c.cli_id
JOIN con_contato con ON c.con_fk = con.con_id
JOIN fun_funcionario f ON p.funcionario_fk = f.fun_id
JOIN ite_itens i ON p.ite_fk = i.ite_id;
