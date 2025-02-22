import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

export const registry = new OpenAPIRegistry();

export const bearerAuth = registry.registerComponent(
	"securitySchemes",
	"bearerAuth",
	{
		type: "http",
		scheme: "bearer",
		bearerFormat: "JWT",
	},
);
