import { createLogger, format, transports } from "winston";

import config from "../config/config";
import { isObject } from "../utils/object";
const { combine, timestamp, printf, colorize } = format;

const withTimestampFormat = printf(({ level, message, timestamp }) => {
  const formattedMessage = isObject(message)
    ? JSON.stringify(message, null, 4)
    : message;
  return `${timestamp} [${level}]: ${formattedMessage}`;
});

const logger = createLogger({
  level: "info",
  format: combine(timestamp(), withTimestampFormat),
  transports: [
    new transports.File({ filename: "error.log", level: "error" }),
    new transports.File({ filename: "combined.log" }),
  ],
});

if (config.withConsoleTransport) {
  logger.add(
    new transports.Console({
      format: combine(colorize(), timestamp(), withTimestampFormat),
    })
  );
}

export default logger;
