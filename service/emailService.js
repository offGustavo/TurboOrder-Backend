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