import mongoose from "mongoose";
import config from "../config/config.service";
import logger from "./logger.service";

export const connectDatabase = async () => {
	try {
		logger.info("Connecting database...");
		await mongoose.connect(config.MONGO_DATABASE_URL);
		logger.info("Database connected");
	} catch (err) {
		logger.error((err as Error).message);
		process.exit(1);
	}
};

export const disconnectDatabase = async () => {
	await mongoose.disconnect();
	logger.info("Database disconnected");
};
