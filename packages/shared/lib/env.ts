import { z } from "zod";

const envSchema = z.object({
  // BDD
  DATABASE_URL: z.string().min(1, "DATABASE_URL requise"),
  DATABASE_URL_SERVICE: z.string().min(1, "DATABASE_URL_SERVICE requise"),

  // Supabase (auth uniquement)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("NEXT_PUBLIC_SUPABASE_URL invalide"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY requise"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "SUPABASE_SERVICE_ROLE_KEY requise"),

  // Sécurité
  ENCRYPTION_KEY: z
    .string()
    .length(64, "ENCRYPTION_KEY doit faire exactement 64 caractères hex")
    .regex(/^[0-9a-fA-F]+$/, "ENCRYPTION_KEY doit être hexadécimale"),

  // Emails
  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY requise"),
  RESEND_WEBHOOK_SECRET: z.string().optional(),

  // Optionnels
  NEXT_PUBLIC_APP_URL: z.string().url().optional().default("http://localhost:3000"),
  BETTER_STACK_TOKEN: z.string().optional().default(""),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Valide toutes les variables d'environnement au démarrage.
 * Lance une erreur explicite si une variable requise manque.
 *
 * @example
 * // En haut de l'app ou dans un middleware
 * import { env } from "@zelian/shared/lib/env";
 * console.log(env.DATABASE_URL);
 */
export const env = envSchema.parse(process.env);
