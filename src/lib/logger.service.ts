import pino from "pino";
import pinohttpLogger from "pino-http";

const logger = pino({
	transport: {
		target: "pino-pretty",
		options: {
			colorize: true,
		},
	},
});

export const httpLogger = pinohttpLogger({ logger: logger });

export default logger;
