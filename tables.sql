-- ALTER TABLE end_endereco MODIFY COLUMN end_cep VARCHAR(10);
--
-- ALTER TABLE end_endereco MODIFY COLUMN end_cep VARCHAR(10);

-- pro_produto
CREATE TABLE pro_produto ( pro_id INT PRIMARY KEY AUTO_INCREMENT, pro_nome VARCHAR(255), pro_tipo VARCHAR(255), pro_ativo boolean);

INSERT INTO pro_produto (pro_id, pro_nome, pro_tipo, pro_ativo) VALUES 
(1, 'Arroz Branco', 'Arroz', true),
(2, 'Feijão Preto', 'Feijão', true),
(3, 'Macarrão Espaguete', 'Massa', true),
(4, 'Carne Bovina', 'Carne', true),
(5, 'Farofa de Bacon', 'Acompanhamento', true),
(6, 'Salada Mista', 'Salada', true),
(7, 'Arroz Integral', 'Arroz', false),
(8, 'Feijão Carioca', 'Feijão', true),
(9, 'Lasanha', 'Massa', false),
(10, 'Frango Grelhado', 'Carne', true);

-- car_cardapio
create table car_cardapio( car_id int primary key, car_data date);

-- Cria a tabela de Cardápio do Dia
create table dia_cardapioDia( dia_id int primary key, pro_fk int, car_fk int, FOREIGN KEY (pro_fk) REFERENCES pro_produto(pro_id), FOREIGN KEY (car_fk) REFERENCES car_cardapio(car_id));

--  Cria a tabela itens do pedido
create table ite_itens ( ite_id int primary key, arroz_fk int, feijao_fk int, massa_fk int, salada_fk int, acomapanhamento_fk int, carne01_fk int, carne02_fk int, FOREIGN KEY (arroz_fk) REFERENCES dia_cardapioDia(dia_id), FOREIGN KEY (feijao_fk) REFERENCES dia_cardapioDia(dia_id), FOREIGN KEY (massa_fk) REFERENCES dia_cardapioDia(dia_id), FOREIGN KEY (salada_fk) REFERENCES dia_cardapioDia(dia_id), FOREIGN KEY (acomapanhamento_fk) REFERENCES dia_cardapioDia(dia_id), FOREIGN KEY (carne01_fk) REFERENCES dia_cardapioDia(dia_id), FOREIGN KEY (carne02_fk) REFERENCES dia_cardapioDia(dia_id));

-- Inserindo dados na tabela pro_produto
INSERT INTO pro_produto (pro_id, pro_titulo, pro_tipo) VALUES (1, 'Arroz', 'grão'), (2, 'Feijão', 'grão'), (3, 'Macarrão', 'massa');

-- Inserindo dados na tabela car_cardapio
INSERT INTO car_cardapio (car_id, car_data) VALUES (1, '2024-10-23'), (2, '2024-10-24'), (3, '2024-10-25');

-- Inserindo dados na tabela dia_cardapioDia
INSERT INTO dia_cardapioDia (dia_id, pro_fk, car_fk) VALUES (5, 1, 2), (6, 3, 2), (7, 4, 2);

SELECT p.pro_id, p.pro_titulo, p.pro_tipo, c.car_data FROM pro_produto p JOIN dia_cardapioDia d ON p.pro_id = d.pro_fk JOIN car_cardapio c ON d.car_fk = c.car_id;


-- GPT
--

CREATE TABLE end_endereco (
    end_id INT PRIMARY KEY AUTO_INCREMENT,
    end_cep INT NOT NULL,
    end_cidade VARCHAR(255) NOT NULL,
    end_bairro VARCHAR(255) NOT NULL,
    end_rua VARCHAR(255) NOT NULL
);

CREATE TABLE con_contato (
    con_id INT PRIMARY KEY AUTO_INCREMENT,
    con_telefone VARCHAR(20) NOT NULL
);

CREATE TABLE emp_empresa (
    emp_id INT PRIMARY KEY AUTO_INCREMENT,
    emp_cnpj VARCHAR(20) NOT NULL,
    endereco_fk INT,
    emp_inscricaoEstado VARCHAR(50),
    emp_razaoSocial VARCHAR(255) NOT NULL,
    contato_fk INT,
    emp_numero INT,
    emp_complemento VARCHAR(255),
    FOREIGN KEY (endereco_fk) REFERENCES end_endereco(end_id),
    FOREIGN KEY (contato_fk) REFERENCES con_contato(con_id)
);

CREATE TABLE cli_cliente (
    cli_id INT PRIMARY KEY AUTO_INCREMENT,
    cli_nome VARCHAR(255) NOT NULL,
    cli_sobrenome VARCHAR(255) NOT NULL,
    endereco_fk INT,
    contato_fk INT,
    empresa_fk INT,
    cli_numero INT,
    cli_complemento VARCHAR(255),
    cli_ativo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (endereco_fk) REFERENCES end_endereco(end_id),
    FOREIGN KEY (contato_fk) REFERENCES con_contato(con_id),
    FOREIGN KEY (empresa_fk) REFERENCES emp_empresa(emp_id)
);

CREATE TABLE fun_funcionario (
    fun_id INT PRIMARY KEY AUTO_INCREMENT,
    fun_nome VARCHAR(255) NOT NULL,
    fun_email VARCHAR(255) NOT NULL UNIQUE
);

-- TODO: Criar tabela de valor do pedido
CREATE TABLE ped_pedido (
    ped_id INT PRIMARY KEY AUTO_INCREMENT,
    cliente_fk INT,
    funcionario_fk INT,
    ite_fk INT,
    ped_status INT NOT NULL,
    ped_valor FLOAT NOT NULL,
    ped_data DATE NOT NULL,
    ped_tipoPagamento VARCHAR(50),
    ped_observacao TINYTEXT NULL,
    ped_desativado BOOLEAN NOT NULL DEFAULT FALSE,
    ped_ordem_dia INT NOT NULL DEFAULT 0,
    FOREIGN KEY (cliente_fk) REFERENCES cli_cliente(cli_id),
    FOREIGN KEY (funcionario_fk) REFERENCES fun_funcionario(fun_id)
);

-- ALTER TABLE ped_pedido ADD COLUMN ordem_dia INT NOT NULL DEFAULT 0;
--
-- ALTER TABLE ped_pedido CHANGE COLUMN ordem_dia ped_ordem_dia INT NOT NULL DEFAULT 0;


CREATE TABLE pro_produto (
    pro_id INT PRIMARY KEY AUTO_INCREMENT,
    pro_nome VARCHAR(255) NOT NULL,
    pro_tipo VARCHAR(100),
    pro_ativo BOOLEAN NOT NULL
);

CREATE TABLE car_cardapio (
    car_id INT PRIMARY KEY AUTO_INCREMENT,
    car_data DATE NOT NULL
);

CREATE TABLE dia_cardapioDia (
    dia_id INT PRIMARY KEY AUTO_INCREMENT,
    pro_fk INT NOT NULL,
    car_fk INT NOT NULL,
    FOREIGN KEY (pro_fk) REFERENCES pro_produto(pro_id),
    FOREIGN KEY (car_fk) REFERENCES car_cardapio(car_id)
);

CREATE TABLE ite_itens (
    ite_id INT PRIMARY KEY AUTO_INCREMENT,
    arroz_fk INT,
    feijao_fk INT,
    massa_fk INT,
    salada_fk INT,
    acompanhamento_fk INT,
    carne01_fk INT,
    carne02_fk INT,
    FOREIGN KEY (arroz_fk) REFERENCES pro_produto(pro_id),
    FOREIGN KEY (feijao_fk) REFERENCES pro_produto(pro_id),
    FOREIGN KEY (massa_fk) REFERENCES pro_produto(pro_id),
    FOREIGN KEY (salada_fk) REFERENCES pro_produto(pro_id),
    FOREIGN KEY (acompanhamento_fk) REFERENCES pro_produto(pro_id),
    FOREIGN KEY (carne01_fk) REFERENCES pro_produto(pro_id),
    FOREIGN KEY (carne02_fk) REFERENCES pro_produto(pro_id)
);

