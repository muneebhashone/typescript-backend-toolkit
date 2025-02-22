import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export const handleHealthCheck = async (_: Request, res: Response) => {
	const healthCheck = {
		uptime: process.uptime(),
		responseTime: process.hrtime(),
		message: "OK",
		timestamp: Date.now(),
	};

	try {
		res.send(healthCheck);
	} catch (error) {
		healthCheck.message = (error as Error).message;

		res.status(StatusCodes.SERVICE_UNAVAILABLE).send(healthCheck);
	}
};
