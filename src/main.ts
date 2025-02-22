import "./openapi/zod-extend";

import { createServer } from "node:http";
import path from "node:path";
import process from "node:process";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import session from "express-session";
import helmet from "helmet";
import morgan from "morgan";
import config from "./config/config.service";
import { connectDatabase, disconnectDatabase } from "./lib/database";
import logger, { httpLogger } from "./lib/logger.service";
import { useSocketIo } from "./lib/realtime.server";
import redisStore from "./lib/session.store";
import { extractJwt } from "./middlewares/extract-jwt-schema.middleware";
import apiRoutes from "./routes/routes";

import swaggerUi from "swagger-ui-express";

import YAML from "yaml";
import { convertDocumentationToYaml } from "./openapi/swagger-doc-generator";
import globalErrorHandler from "./utils/globalErrorHandler";

const app = express();

app.set("trust proxy", true);

const server = createServer(app);

const io = useSocketIo(server);

const boostrapServer = async () => {
	await connectDatabase();

	app.use((req, _, next) => {
		req.io = io;
		next();
	});

	app.use(
		cors({
			origin: [config.CLIENT_SIDE_URL],
			optionsSuccessStatus: 200,
			credentials: true,
		}),
	);

	if (config.NODE_ENV === "development") {
		app.use(morgan("dev"));
	} else {
		app.use(httpLogger);
	}

	app.use(express.json());
	app.use(express.urlencoded({ extended: false }));

	app.use(
		session({
			secret: config.JWT_SECRET,
			resave: false,
			saveUninitialized: true,
			cookie: { secure: true },
			store: redisStore,
		}),
	);

	// Middleware to serve static files
	app.use(express.static(path.join(__dirname, "..", "public")));

	app.use(cookieParser());

	app.use(compression());

	app.use(extractJwt);

	if (config.NODE_ENV === "production") {
		app.use(helmet());
	}

	app.use("/api", apiRoutes);

	const swaggerDocument = YAML.parse(convertDocumentationToYaml());
	app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

	const serverAdapter = new ExpressAdapter();
	serverAdapter.setBasePath("/admin/queues");

	createBullBoard({
		queues: Object.entries(global.__registeredQueues || {}).map(
			([, values]) => new BullMQAdapter(values.queue),
		),
		serverAdapter,
	});

	// Dashbaord for BullMQ
	app.use("/admin/queues", serverAdapter.getRouter());

	// Global Error Handler
	app.use(globalErrorHandler);

	server.listen(config.PORT, () => {
		logger.info(`Server is running on http://localhost:${config.PORT}`);
		logger.info(`RESTful API: http://localhost:${config.PORT}/api`);
		logger.info(`Swagger API Docs: http://localhost:${config.PORT}/api-docs`);
		logger.info(`BullBoard: http://localhost:${config.PORT}/admin/queues`);
		logger.info(`Client-side url set to: ${config.CLIENT_SIDE_URL}`);
	});
};

boostrapServer().catch((err) => {
	logger.error(err.message);
	process.exit(1);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
	process.on(signal, async () => {
		await disconnectDatabase();
		logger.info("Server is shutting down...");
		io.disconnectSockets(true);
		logger.info("Server disconnected from sockets");
		server.close();
		logger.info("Server closed");
		process.exit(0);
	});
}

process.on("uncaughtException", (err) => {
	logger.error(err.message);
	process.exit(1);
});
