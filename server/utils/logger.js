// server/utils/logger.js
import winston from "winston";
import path from "path";
import fs from "fs";

const logDir = path.resolve("logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const { combine, timestamp, printf, colorize } = winston.format;

const logFormat = printf(({ level, message, timestamp }) =>
  `${timestamp} [${level.toUpperCase()}]: ${message}`
);

const transports = [];

// Console in non‑production
if (process.env.NODE_ENV !== "production") {
  transports.push(
    new winston.transports.Console({
      format: combine(colorize(), timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), logFormat),
    })
  );
}

// Always write errors
transports.push(
  new winston.transports.File({
    filename: path.join(logDir, "error.log"),
    level: "error",
  })
);

// And all logs
transports.push(
  new winston.transports.File({
    filename: path.join(logDir, "combined.log"),
  })
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), logFormat),
  transports,
  exceptionHandlers: [
    new winston.transports.File({ filename: path.join(logDir, "exceptions.log") })
  ],
  exitOnError: false,
});

export default logger;
