import fs from "node:fs/promises";
import { OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import * as yaml from "yaml";

import type { OpenAPIObject } from "openapi3-ts/oas30";
import config from "../config/config.service";
import { registry } from "./swagger-instance";

export const getOpenApiDocumentation = (): OpenAPIObject => {
	const generator = new OpenApiGeneratorV3(registry.definitions);

	return generator.generateDocument({
		openapi: "3.0.0",
		info: {
			version: config.APP_VERSION,
			title: config.APP_NAME,
			description:
				"Robust backend boilerplate designed for scalability, flexibility, and ease of development. It's packed with modern technologies and best practices to kickstart your next backend project",
		},
		servers: [{ url: "/api" }],
	});
};

export const convertDocumentationToYaml = (): string => {
	const docs = getOpenApiDocumentation();

	const fileContent = yaml.stringify(docs);

	return fileContent;
};

export const writeDocumentationToDisk = async (): Promise<void> => {
	const fileContent = convertDocumentationToYaml();

	await fs.writeFile(`${__dirname}/openapi-docs.yml`, fileContent, {
		encoding: "utf-8",
	});
};
