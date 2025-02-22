import { StatusCodes } from "http-status-codes";
import z from "zod";

export const searchAndPaginationSchema = z.object({
	search: z.string().optional(),
	page: z.string().default("1").transform(Number).optional(),
	limit: z.string().default("10").transform(Number).optional(),
});

export const returnMessageSchema = z.object({
	status: z
		.number()
		.refine((value) => Object.values(StatusCodes).includes(value)),
	message: z.string(),
});

export type ReturnMessageSchemaType = z.infer<typeof returnMessageSchema>;
