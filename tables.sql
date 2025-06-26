CREATE DATABASE IF NOT EXISTS turboOrder;
USE turboOrder;

CREATE TABLE IF NOT EXISTS end_endereco (
    end_id INT PRIMARY KEY AUTO_INCREMENT,
    end_cep INT NOT NULL,
    end_cidade VARCHAR(255) NOT NULL,
    end_bairro VARCHAR(255) NOT NULL,
    end_rua VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS con_contato (
    con_id INT PRIMARY KEY AUTO_INCREMENT,
    con_telefone VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS emp_empresa (
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

CREATE TABLE IF NOT EXISTS fun_funcionario (
    fun_id INT PRIMARY KEY AUTO_INCREMENT,
    fun_nome VARCHAR(255) NOT NULL,
    fun_email VARCHAR(255) NOT NULL UNIQUE,
    fun_senha VARCHAR(255) NOT NULL,
    fun_role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    fun_admin_approved BOOLEAN NOT NULL DEFAULT FALSE,
    fun_codigo_verificacao VARCHAR(6),
    fun_verificado BOOLEAN NOT NULL DEFAULT FALSE,
    fun_ativo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS cli_cliente (
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

CREATE TABLE IF NOT EXISTS pro_produto (
    pro_id INT PRIMARY KEY AUTO_INCREMENT,
    pro_nome VARCHAR(255) NOT NULL,
    pro_tipo VARCHAR(100),
    pro_ativo BOOLEAN NOT NULL
);

CREATE TABLE IF NOT EXISTS car_cardapio (
    car_id INT PRIMARY KEY AUTO_INCREMENT,
    car_data DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS ite_itens (
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

CREATE TABLE IF NOT EXISTS ped_pedido (
    ped_id INT PRIMARY KEY AUTO_INCREMENT,
    cliente_fk INT,
    funcionario_fk INT,
    ite_fk INT,
    ped_status ENUM('Em Andamento', 'Concluído', 'Cancelado') NOT NULL,
    ped_valor FLOAT NOT NULL,
    ped_data DATE NOT NULL,
    ped_tipoPagamento VARCHAR(50),
    ped_observacao TINYTEXT NULL,
    ped_desativado BOOLEAN NOT NULL DEFAULT FALSE,
    ped_ordem_dia INT NOT NULL DEFAULT 0,
    ped_horarioRetirada TIME DEFAULT NULL,
    ped_updated_at  datetime DEFAULT current_timestamp(),
    FOREIGN KEY (cliente_fk) REFERENCES cli_cliente(cli_id),
    FOREIGN KEY (funcionario_fk) REFERENCES fun_funcionario(fun_id),
    FOREIGN KEY (ite_fk) REFERENCES ite_itens(ite_id)
);

CREATE TABLE IF NOT EXISTS dia_cardapioDia (
    dia_id INT PRIMARY KEY AUTO_INCREMENT,
    pro_fk INT NOT NULL,
    car_fk INT NOT NULL,
    FOREIGN KEY (pro_fk) REFERENCES pro_produto(pro_id),
    FOREIGN KEY (car_fk) REFERENCES car_cardapio(car_id)
);

-- Insert admin - senha admin
INSERT INTO fun_funcionario (fun_nome, fun_email, fun_senha, fun_role, fun_admin_approved, fun_verificado, fun_ativo) VALUES ('Administrador', 'admin@empresa.com', '$2a$12$v3/nZRiwuubQdhi499KnHekzjniUjN0C28wEUX4VSuDNzZPSOr4Xy', 'admin', TRUE, TRUE, TRUE);


-- Inserções para a tabela pro_produto
INSERT INTO pro_produto (pro_nome, pro_tipo, pro_ativo) VALUES
-- Arroz
('Arroz Branco', 'Arroz', true),
('Arroz Integral', 'Arroz', true),
('Arroz Selvagem', 'Arroz', true),
('Arroz Arbóreo', 'Arroz', true),
('Arroz Negro', 'Arroz', true),

-- Feijão
('Feijão Carioca', 'Feijão', true),
('Feijão Preto', 'Feijão', true),
('Feijão Branco', 'Feijão', true),
('Feijão Vermelho', 'Feijão', true),
('Feijão Fradinho', 'Feijão', true),

-- Massa
('Espaguete', 'Massa', true),
('Penne', 'Massa', true),
('Fusilli', 'Massa', true),
('Lasanha', 'Massa', true),
('Ravioli', 'Massa', true),

-- Carne
('Filé Mignon', 'Carne', true),
('Alcatra', 'Carne', true),
('Picanha', 'Carne', true),
('Frango', 'Carne', true),
('Peixe', 'Carne', true),

-- Acompanhamento
('Purê de Batata', 'Acompanhamento', true),
('Farofa', 'Acompanhamento', true),
('Polenta', 'Acompanhamento', true),
('Legumes Grelhados', 'Acompanhamento', true),
('Batata Rosti', 'Acompanhamento', true),

-- Salada
('Salada Verde', 'Salada', true),
('Salada Caesar', 'Salada', true),
('Salada de Tomate', 'Salada', true),
('Salada de Repolho', 'Salada', true),
('Salada de Grãos', 'Salada', true);
