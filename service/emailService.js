import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "turboOrder.pi@gmail.com",
    pass: "kghb dqeh mdns vhly"
  }
});

export const sendVerificationCode = (email, code) => {
  const mailOptions = {
    from: "turboOrder.pi@gmail.com",
    to: email,
    subject: "Código de Verificação",
    html: `<p>Seu código de verificação é: <b>${code}</b></p>`
  };

  return transporter.sendMail(mailOptions);
};

export const sendAdminNotification = (adminEmail, userEmail) => {
  const mailOptions = {
    from: "turboOrder.pi@gmail.com",
    to: adminEmail,
    subject: "Notificação de solicitação de redefinição de senha",
    html: `<p>O usuário com o email <b>${userEmail}</b> solicitou a redefinição de senha, mas o email dele não está verificado.</p>
           <p>Por favor, verifique e tome as providências necessárias.</p>
           <p>Acesse a tabela de <a href="http://localhost:3000/funcionarios" target="_blank">Gerenciamento de Funcionários</a> para mais detalhes.</p>`
  };

  return transporter.sendMail(mailOptions);
};
