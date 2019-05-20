import { createLogger, format, transports } from 'winston';
import * as winston from 'winston';

const { combine, colorize, printf, timestamp } = format;

const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

/**
 * Initializing winston's logger to capture the run and error logs
 */
export const winstonLogger: winston.Logger = createLogger({
  transports: [
    new transports.Console({ level: 'debug' }),
    new transports.File({ filename: 'icon-magic-run.log', level: 'silly' }),
    new transports.File({ filename: 'icon-magic-error.log', level: 'error' })
  ],
  format: combine(colorize(), timestamp(), myFormat)
});

/**
 * Wrapper around winston's logger
 */
export interface Logger {
  error: Function;
  debug: Function;
  info: Function;
}

/**
 * Wrapper around winston's logger that takes in a fileName
 * @param fileName name of the file that's added as a label to the logging data
 */
export const logger = (fileName: string): Logger => {
  return {
    error: function(msg: string) {
      winstonLogger.error({ message: msg, label: fileName });
    },
    debug: function(msg: string) {
      winstonLogger.debug({ message: msg, label: fileName });
    },
    info: function(msg: string) {
      winstonLogger.info({ message: msg, label: fileName });
    }
  };
};
