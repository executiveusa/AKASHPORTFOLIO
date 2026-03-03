export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

export class StructuredLogger {
  private readonly entries: LogEntry[] = [];

  log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    this.entries.push({
      level,
      message,
      context,
      timestamp: new Date().toISOString(),
    });
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context);
  }

  error(message: string, context?: Record<string, unknown>): void {
    this.log('error', message, context);
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log('debug', message, context);
  }

  snapshot(): LogEntry[] {
    return [...this.entries];
  }
}

export async function withRetries<T>(
  operation: () => Promise<T>,
  logger: StructuredLogger,
  attempts = 3,
  baseDelayMs = 100,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      logger.warn('Operation failed; retrying if attempts remain.', {
        attempt,
        attempts,
        error: error instanceof Error ? error.message : String(error),
      });

      if (attempt < attempts) {
        await delay(baseDelayMs * attempt);
      }
    }
  }

  logger.error('Operation exhausted all retry attempts.', {
    attempts,
    error: lastError instanceof Error ? lastError.message : String(lastError),
  });

  throw lastError;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
