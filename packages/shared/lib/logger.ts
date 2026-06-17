import { Logtail } from "@logtail/node";

const token = process.env.BETTER_STACK_TOKEN;

// En dev sans token → fallback console
const logtail = token ? new Logtail(token) : null;

type LogLevel = "info" | "warn" | "error" | "debug";

interface LogPayload {
  message: string;
  level?: LogLevel;
  context?: Record<string, unknown>;
}

/**
 * Logger centralisé — Better Stack / Logtail en prod, console en dev.
 *
 * @example
 * log({ message: "Parcours créé", context: { parcoursId: "abc" } });
 * log({ message: "Erreur signature", level: "error", context: { error } });
 */
export function log({ message, level = "info", context = {} }: LogPayload) {
  if (logtail) {
    logtail[level](message, context);
  } else {
    const consoleMethod = level === "error" ? console.error : level === "warn" ? console.warn : console.log;
    consoleMethod(`[${level.toUpperCase()}]`, message, context);
  }
}

/**
 * Flush les logs en attente (appeler en fin de Server Action / API Route si nécessaire).
 */
export async function flushLogs() {
  if (logtail) {
    await logtail.flush();
  }
}
