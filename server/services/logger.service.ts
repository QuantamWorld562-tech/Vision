import pino from "pino";
import env from "../config/env.ts";

export const logger = pino({
  level: env.NODE_ENV === "production" ? "info" : "debug",
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => ({ level: label }),
  },
  base: {
    service: "vision-api",
    env: env.NODE_ENV,
  },
});

export default logger;
