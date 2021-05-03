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
interface LoggerInterface {
  error(msg: string): void;
  debug(msg: string): void;
  info(msg: string): void;
  setDebug(debug: boolean): void;
}

/**
 * Wrapper around winston's logger that takes in a fileName
 * @const debugState <boolean> defaults to false, passed in from cli flags.
 * Using commander, -d or --debug flag will make this true.
 * @param fileName name of the file that's added as a label to the logging data
 */
export class Logger implements LoggerInterface{
  fileName: string;
  static debugState: boolean = false;
  constructor(fileName: string) {
    this.fileName = fileName;
  }
  error(msg: string = ''): void {
    winstonLogger.error({ message: msg, label: this.fileName });
  }
  debug(msg: string = ''): void {
    if (Logger.debugState) {
      winstonLogger.debug({ message: msg, label: this.fileName });
    }
  }
  info(msg: string): void {
    winstonLogger.info({ message: msg, label: this.fileName });
  }
  setDebug(debug: boolean): void {
    Logger.debugState = debug;
  }
}
