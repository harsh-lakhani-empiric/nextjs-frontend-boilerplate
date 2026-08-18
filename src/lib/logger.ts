type LogLevel = "debug" | "info" | "warn" | "error";
type LogMeta = Record<string, unknown>;

export type LogSink = (level: LogLevel, message: string, meta?: LogMeta) => void;

const consoleSink: LogSink = (level, message, meta) => {
  const line = `[${level}] ${message}`;
  if (meta) {
    console[level](line, meta);
  } else {
    console[level](line);
  }
};

/**
 * The sink lives on globalThis rather than in a module-level `let`.
 *
 * Next.js compiles instrumentation.ts, the Sentry config files and your application code into
 * separate bundles, and each one gets its own evaluated copy of this module. With module-level
 * state, setLogSink() called from instrumentation mutates a copy that no Route Handler or Server
 * Action ever reads: two live loggers in one process, the sink installed on the wrong one, and
 * every logger.error() still going only to the console. It fails silently, because the console
 * output is identical either way.
 *
 * globalThis is shared across those bundles, so whichever one installs the sink, all of them see it.
 */
const carrier = globalThis as unknown as { __appLogSink?: LogSink };

/** Swap the sink to route logs to Sentry/etc. without touching call sites. */
export function setLogSink(nextSink: LogSink): void {
  carrier.__appLogSink = nextSink;
}

/** Restores console-only logging. Mainly useful in tests. */
export function resetLogSink(): void {
  delete carrier.__appLogSink;
}

function sink(level: LogLevel, message: string, meta?: LogMeta): void {
  (carrier.__appLogSink ?? consoleSink)(level, message, meta);
}

export const logger = {
  debug: (message: string, meta?: LogMeta) => sink("debug", message, meta),
  info: (message: string, meta?: LogMeta) => sink("info", message, meta),
  warn: (message: string, meta?: LogMeta) => sink("warn", message, meta),
  error: (message: string, meta?: LogMeta) => sink("error", message, meta),
};
