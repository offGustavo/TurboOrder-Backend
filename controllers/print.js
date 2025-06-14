import { db } from "../db.js";
import ThermalPrinter from "node-thermal-printer";

export const printOrderById = (req, res) => {
  const { ped_id } = req.body;

  if (!ped_id) {
    return res.status(400).json({ success: false, message: "ID do pedido é obrigatório" });
  }

  const query = `
    SELECT 
      p.ped_id,
      p.ped_tipoPagamento,
      p.ped_observacao,
      p.ped_horarioRetirada,
      p.ped_valor,

      c.cli_nome,
      c.cli_sobrenome,
      c.cli_numero,
      c.cli_complemento,

      endd.end_cep,
      endd.end_cidade,
      endd.end_bairro,
      endd.end_rua,

      cont.con_telefone,

      ite.arroz_fk,
      ite.feijao_fk,
      ite.massa_fk,
      ite.salada_fk,
      ite.acompanhamento_fk,
      ite.carne01_fk,
      ite.carne02_fk

    FROM ped_pedido p
    JOIN cli_cliente c ON p.cliente_fk = c.cli_id
    LEFT JOIN end_endereco endd ON c.endereco_fk = endd.end_id
    LEFT JOIN con_contato cont ON c.contato_fk = cont.con_id
    JOIN ite_itens ite ON p.ite_fk = ite.ite_id
    WHERE p.ped_id = ? AND p.ped_desativado = FALSE
  `;

  db.query(query, [ped_id], (err, results) => {
    if (err) {
      console.error("Erro na consulta:", err);
      return res.status(500).json({ success: false, message: "Erro no banco de dados" });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: "Pedido não encontrado" });
    }

    const pedido = results[0];

    const fetchProductName = (pro_id) => {
      return new Promise((resolve, reject) => {
        if (!pro_id) return resolve(null);
        db.query("SELECT pro_nome FROM pro_produto WHERE pro_id = ? AND pro_ativo = TRUE", [pro_id], (err, res) => {
          if (err) return reject(err);
          if (res.length === 0) return resolve(null);
          resolve(res[0].pro_nome);
        });
      });
    };

    Promise.all([
      fetchProductName(pedido.arroz_fk),
      fetchProductName(pedido.feijao_fk),
      fetchProductName(pedido.massa_fk),
      fetchProductName(pedido.salada_fk),
      fetchProductName(pedido.acompanhamento_fk),
      fetchProductName(pedido.carne01_fk),
      fetchProductName(pedido.carne02_fk)
    ]).then(async ([
      arroz,
      feijao,
      massa,
      salada,
      acompanhamento,
      carne1,
      carne2
    ]) => {
      const selectedProducts = {
        Arroz: arroz,
        Feijão: feijao,
        Massa: massa,
        Salada: salada,
        Acompanhamento: acompanhamento,
        Carne: carne1,
        Carne2: carne2,
      };

      // Configurar a impressora
      const printer = new ThermalPrinter.printer({
        type: ThermalPrinter.types.EPSON,
        interface: "usb", // pode ser "printer:POS-58", "file:/dev/usb/lp0", "usb" etc.
        characterSet: "SLOVENIA",
        removeSpecialCharacters: false,
        lineCharacter: "-",
        options: {
          timeout: 5000,
        },
      });

      const isConnected = await printer.isPrinterConnected();
      if (!isConnected) {
        return res.status(500).json({ success: false, message: "Impressora não conectada" });
      }

      try {
        printer.alignCenter();
        printer.setTextSize(2, 2);
        printer.println("Pedido");
        printer.setTextSize(1, 1);
        printer.drawLine();

        printer.alignLeft();
        printer.println(`Cliente: ${pedido.cli_nome} ${pedido.cli_sobrenome}`);
        printer.println(`Telefone: ${pedido.con_telefone || "-"}`);
        printer.println(`Endereço: ${pedido.end_rua || "-"}, ${pedido.cli_numero || "-"} ${pedido.cli_complemento || "-"} - ${pedido.end_bairro || "-"}, ${pedido.end_cidade || "-"} - CEP: ${pedido.end_cep || "-"}`);
        printer.println(`Pagamento: ${pedido.ped_tipoPagamento || "-"}`);
        printer.println(`Observações: ${pedido.ped_observacao || "-"}`);
        printer.println("Produtos:");

        for (const [categoria, nome] of Object.entries(selectedProducts)) {
          if (nome) printer.println(`- ${categoria}: ${nome}`);
        }

        if (pedido.ped_horarioRetirada) {
          printer.println(`Retirada: ${pedido.ped_horarioRetirada}`);
        }

        printer.drawLine();
        printer.cut();
        await printer.execute();

        res.json({ success: true, message: "Impressão enviada com sucesso" });
      } catch (err) {
        console.error("Erro na impressão:", err);
        res.status(500).json({ success: false, message: "Erro ao imprimir" });
      }
    }).catch(err => {
      console.error("Erro ao buscar nomes dos produtos:", err);
      res.status(500).json({ success: false, message: "Erro ao buscar dados dos produtos" });
    });
  });
};
