import EmailLoginCode from "@/components/custom-ui/EmailLoginCode";
import { Resend } from "resend";

const resend = new Resend(process.env.NEXT_RESEND_API_KEY);

export const sendLoginCode = async ({ code, to }) => {
  const { data, error } = await resend.emails.send({
    from: "Aquapp <info@aquapp.lat>",
    to,
    subject: "Código para iniciar sesión: " + code,
    react: EmailLoginCode({ code }),
  });

  return error ? error : data;
};

export const generateLoginCode = () => {
  const uppercase_characters = "0123456789";
  let codigo = "";
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * uppercase_characters.length);
    codigo += uppercase_characters[randomIndex];
  }
  return codigo;
};
