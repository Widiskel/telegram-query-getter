import { createLogger, format, transports, Logger as WinstonLogger } from "winston";

const { combine, timestamp, printf, colorize } = format;

const customFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

class Logger {
  private logger: WinstonLogger;

  constructor() {
    this.logger = createLogger({
      level: "debug",
      format: combine(
        timestamp({
          format: "YYYY-MM-DD HH:mm:ss",
        }),
        colorize(),
        customFormat
      ),
      transports: [new transports.File({ filename: "log/app.log" })],
      exceptionHandlers: [new transports.File({ filename: "log/app.log" })],
      rejectionHandlers: [new transports.File({ filename: "log/app.log" })],
    });
  }

  info(message: string): void {
    this.logger.info(message);
  }

  warn(message: string): void {
    this.logger.warn(message);
  }

  error(message: string): void {
    this.logger.error(message);
  }

  debug(message: string): void {
    this.logger.debug(message);
  }

  setLevel(level: string): void {
    this.logger.level = level;
  }
}

export default new Logger();
