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

let sink: LogSink = consoleSink;

/** Swap the sink to route logs to Sentry/etc. without touching call sites. */
export function setLogSink(nextSink: LogSink): void {
  sink = nextSink;
}

export const logger = {
  debug: (message: string, meta?: LogMeta) => sink("debug", message, meta),
  info: (message: string, meta?: LogMeta) => sink("info", message, meta),
  warn: (message: string, meta?: LogMeta) => sink("warn", message, meta),
  error: (message: string, meta?: LogMeta) => sink("error", message, meta),
};
