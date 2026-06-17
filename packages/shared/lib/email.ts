import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  react: React.ReactElement;
  from?: string;
}

/**
 * Wrapper Resend v4 + React Email.
 * Utiliser cette fonction pour TOUS les envois d'emails.
 *
 * @example
 * await sendEmail({
 *   to: "collaborateur@example.com",
 *   subject: "Bienvenue chez Zelian",
 *   react: <WelcomeEmail name="Jean" />,
 * });
 */
export async function sendEmail({
  to,
  subject,
  react,
  from = "Zelian <noreply@zelian.fr>",
}: SendEmailOptions) {
  const { data, error } = await resend.emails.send({
    from,
    to: Array.isArray(to) ? to : [to],
    subject,
    react,
  });

  if (error) {
    console.error("[email] Erreur envoi :", error);
    throw new Error(`Échec envoi email : ${error.message}`);
  }

  return data;
}
