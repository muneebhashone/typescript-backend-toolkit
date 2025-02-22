import { Router } from "express";
import { handleHealthCheck } from "./healthcheck.controller";

export const HEALTH_ROUTER_ROOT = "/healthcheck";

const healthCheckRouter = Router();

healthCheckRouter.get("/", handleHealthCheck);

export default healthCheckRouter;
