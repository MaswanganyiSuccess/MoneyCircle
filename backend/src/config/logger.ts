import { config } from './env';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const log = (level: LogLevel, message: string, meta?: any) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...(meta && { meta }),
    environment: config.nodeEnv,
  };
  console[level](JSON.stringify(logEntry));
};

export const logger = {
  info: (message: string, meta?: any) => log('info', message, meta),
  warn: (message: string, meta?: any) => log('warn', message, meta),
  error: (message: string, meta?: any) => log('error', message, meta),
  debug: (message: string, meta?: any) => log('debug', message, meta),
};