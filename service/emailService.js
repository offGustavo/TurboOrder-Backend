import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "turboOrder.pi@gmail.com",
    pass: "kghb dqeh mdns vhly",
  },
});

export const sendVerificationCode = (email, code) => {
  const mailOptions = {
    from: "turboOrder.pi@gmail.com",
    to: email,
    subject: "Código de Verificação",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
        <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); padding: 20px;">
          <h2 style="color: #333;">Verificação de E-mail</h2>
          <p style="font-size: 16px; color: #555;">Olá,</p>
          <p style="font-size: 16px; color: #555;">
            Para continuar com o processo, por favor utilize o código abaixo para verificar seu e-mail:
          </p>
          <p style="font-size: 24px; font-weight: bold; color: #FD1F4A; text-align: center; margin: 20px 0;">${code}</p>
          <p style="font-size: 14px; color: #777;">
            Caso você não tenha solicitado este código, ignore esta mensagem.
          </p>
          <p style="font-size: 14px; color: #999; text-align: center; margin-top: 30px;">
            TurboOrder © ${new Date().getFullYear()}
          </p>
        </div>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

export const sendAdminNotification = (adminEmail, userEmail) => {
  const mailOptions = {
    from: "turboOrder.pi@gmail.com",
    to: adminEmail,
    subject: "Notificação de solicitação de redefinição de senha",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; padding: 20px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #333;">Solicitação de Redefinição de Senha</h2>
          <p style="font-size: 16px; color: #555;">
            O usuário com o e-mail <strong>${userEmail}</strong> solicitou a redefinição de senha.
          </p>
          <p style="font-size: 16px; color: #555;">
            Por favor, verifique e tome as providências necessárias.
          </p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:3000/funcionarios" target="_blank" style="background-color: #FD1F4A; color: #fff; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Acessar Gerenciamento de Funcionários
            </a>
          </p>
          <p style="font-size: 14px; color: #999; text-align: center; margin-top: 40px;">
            TurboOrder © ${new Date().getFullYear()} — Esta é uma mensagem automática.
          </p>
        </div>
      </div>
    `
  };

  return transporter.sendMail(mailOptions);
};
