CREATE DATABASE IF NOT EXISTS turboOrder;
USE turboOrder;

-- Endereço
CREATE TABLE end_endereco (
    end_id INT PRIMARY KEY AUTO_INCREMENT,
    end_cep INT NOT NULL,
    end_cidade VARCHAR(255) NOT NULL,
    end_bairro VARCHAR(255) NOT NULL,
    end_rua VARCHAR(255) NOT NULL
);

-- Contato
CREATE TABLE con_contato (
    con_id INT PRIMARY KEY AUTO_INCREMENT,
    con_telefone VARCHAR(20) NOT NULL
);

-- Funcionário
CREATE TABLE fun_funcionario (
    fun_id INT PRIMARY KEY AUTO_INCREMENT,
    fun_nome VARCHAR(255) NOT NULL,
    fun_email VARCHAR(255) NOT NULL UNIQUE,
    fun_senha VARCHAR(255) NOT NULL,
    fun_role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    fun_admin_approved BOOLEAN NOT NULL DEFAULT FALSE,
    fun_codigo_verificacao VARCHAR(6),
    fun_verificado BOOLEAN NOT NULL DEFAULT FALSE,
    fun_ativo BOOLEAN NOT NULL DEFAULT TRUE,
    admin_owner_id INT DEFAULT NULL,
    fun_foto VARCHAR(255) NULL,
    FOREIGN KEY (admin_owner_id) REFERENCES fun_funcionario(fun_id)
);

-- Empresa
CREATE TABLE emp_empresa (
    emp_id INT PRIMARY KEY AUTO_INCREMENT,
    emp_cnpj VARCHAR(20) NOT NULL,
    endereco_fk INT,
    emp_inscricaoEstado VARCHAR(50),
    emp_razaoSocial VARCHAR(255) NOT NULL,
    contato_fk INT,
    emp_numero INT,
    emp_complemento VARCHAR(255),
    admin_owner_id INT,
    FOREIGN KEY (endereco_fk) REFERENCES end_endereco(end_id),
    FOREIGN KEY (contato_fk) REFERENCES con_contato(con_id),
    FOREIGN KEY (admin_owner_id) REFERENCES fun_funcionario(fun_id)
);

-- Cliente
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
    admin_owner_id INT,
    FOREIGN KEY (endereco_fk) REFERENCES end_endereco(end_id),
    FOREIGN KEY (contato_fk) REFERENCES con_contato(con_id),
    FOREIGN KEY (empresa_fk) REFERENCES emp_empresa(emp_id),
    FOREIGN KEY (admin_owner_id) REFERENCES fun_funcionario(fun_id)
);

-- Produto
CREATE TABLE pro_produto (
    pro_id INT PRIMARY KEY AUTO_INCREMENT,
    pro_nome VARCHAR(255) NOT NULL,
    pro_tipo VARCHAR(100),
    pro_ativo BOOLEAN NOT NULL,
    admin_owner_id INT,
    FOREIGN KEY (admin_owner_id) REFERENCES fun_funcionario(fun_id)
);

-- Cardápio
CREATE TABLE car_cardapio (
    car_id INT PRIMARY KEY AUTO_INCREMENT,
    car_data DATE NOT NULL,
    admin_owner_id INT,
    FOREIGN KEY (admin_owner_id) REFERENCES fun_funcionario(fun_id)
);

-- Itens
CREATE TABLE ite_itens (
    ite_id INT PRIMARY KEY AUTO_INCREMENT,
    arroz_fk INT,
    feijao_fk INT,
    massa_fk INT,
    salada_fk INT,
    acompanhamento_fk INT,
    carne01_fk INT,
    carne02_fk INT,
    admin_owner_id INT,
    FOREIGN KEY (arroz_fk) REFERENCES pro_produto(pro_id),
    FOREIGN KEY (feijao_fk) REFERENCES pro_produto(pro_id),
    FOREIGN KEY (massa_fk) REFERENCES pro_produto(pro_id),
    FOREIGN KEY (salada_fk) REFERENCES pro_produto(pro_id),
    FOREIGN KEY (acompanhamento_fk) REFERENCES pro_produto(pro_id),
    FOREIGN KEY (carne01_fk) REFERENCES pro_produto(pro_id),
    FOREIGN KEY (carne02_fk) REFERENCES pro_produto(pro_id),
    FOREIGN KEY (admin_owner_id) REFERENCES fun_funcionario(fun_id)
);

-- Pedido
CREATE TABLE ped_pedido (
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
    ped_update_at DATETIME DEFAULT CURRENT_TIMESTAMP(),
    admin_owner_id INT NOT NULL,
    FOREIGN KEY (cliente_fk) REFERENCES cli_cliente(cli_id),
    FOREIGN KEY (funcionario_fk) REFERENCES fun_funcionario(fun_id),
    FOREIGN KEY (ite_fk) REFERENCES ite_itens(ite_id),
    FOREIGN KEY (admin_owner_id) REFERENCES fun_funcionario(fun_id)
);

-- Cardápio do Dia
CREATE TABLE dia_cardapioDia (
    dia_id INT PRIMARY KEY AUTO_INCREMENT,
    pro_fk INT NOT NULL,
    car_fk INT NOT NULL,
    admin_owner_id INT,
    FOREIGN KEY (pro_fk) REFERENCES pro_produto(pro_id),
    FOREIGN KEY (car_fk) REFERENCES car_cardapio(car_id),
    FOREIGN KEY (admin_owner_id) REFERENCES fun_funcionario(fun_id)
);
