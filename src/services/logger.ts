import { createLogger, format, transports } from "winston";
const { combine, timestamp, printf, colorize } = format;

const isObject = (variable: any) => {
  return Object.prototype.toString.call(variable) === "[object Object]";
};

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

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new transports.Console({
      format: combine(colorize(), timestamp(), withTimestampFormat),
    })
  );
}

export default logger;
