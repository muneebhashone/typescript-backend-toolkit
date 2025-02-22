import { type ZodRawShape, type ZodSchema, z } from "zod";
import { paginatorSchema, successResponseSchema } from "./common.schema";

export const defineSuccessResponse = (schema: ZodRawShape) => {
	return successResponseSchema.extend(schema);
};

export const definePaginatedResponse = (schema: ZodSchema) => {
	return defineSuccessResponse({
		data: z.object({
			results: z.array(schema),
			paginatorInfo: paginatorSchema,
		}),
	});
};
