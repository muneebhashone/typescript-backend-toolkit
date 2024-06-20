import { z } from 'zod';

export const getCompaniesSchema = z.object({
  searchString: z.string().default(''),
  limitParam: z.string().default('10').transform(Number),
  pageParam: z.string().default('1').transform(Number),
});

export const createCompanySchema = z.object({
  companyName: z.string().min(1),
  country: z.string().min(1),
  city: z.string().min(1),
});

export const createCompanyAndUserSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email({ message: 'Email is not valid' }),
  name: z.string({ required_error: 'Name is required' }),
  companyName: z.string({ required_error: 'Company name is required' }).min(1),
  country: z.string({ required_error: 'Country is required' }).min(1),
  city: z.string({ required_error: 'City is required' }).min(1),
});

export type CreateCompanySchemaType = z.infer<typeof createCompanySchema>;
export type GetCompaniesSchemaType = z.infer<typeof getCompaniesSchema>;
export type CreateCompanyAndUserSchema = z.infer<
  typeof createCompanyAndUserSchema
>;
