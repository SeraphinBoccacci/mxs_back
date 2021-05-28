import { isEmpty, omit } from "lodash";
import { createLogger, format, transports } from "winston";

import config from "../config/config";
import { isObject } from "../utils/object";
const { combine, timestamp, printf, colorize, errors, metadata } = format;

const withTimestampFormat = printf(
  ({ level, message, metadata: rawMetadata, timestamp }) => {
    const formattedMessage = isObject(message)
      ? JSON.stringify(message, null, 4)
      : message;

    const metadata = omit(rawMetadata, ["timestamp"]);

    return !!metadata && !isEmpty(metadata)
      ? `${timestamp} [${level}]: ${formattedMessage} ${JSON.stringify(
          metadata,
          null,
          4
        )}`
      : `${timestamp} [${level}]: ${formattedMessage}`;
  }
);

const loggerFormat = combine(
  colorize(),
  errors({ stack: true }),
  timestamp(),
  withTimestampFormat,
  metadata()
);

const logger = createLogger({
  level: "info",
  format: loggerFormat,
  transports: [
    new transports.File({ filename: "error.log", level: "error" }),
    new transports.File({ filename: "combined.log" }),
  ],
});

if (config.withConsoleTransport) {
  logger.add(
    new transports.Console({
      format: loggerFormat,
    })
  );
}

export default logger;
