import { AnyZodObject, ZodEffects, ZodSchema } from 'zod';
import { IUser } from './user/user.model';

export type UserType = IUser & { _id?: string };

type ZodObjectWithEffect =
  | AnyZodObject
  | ZodEffects<ZodObjectWithEffect, unknown, unknown>;

export interface GoogleCallbackQuery {
  code: string;
  error?: string;
}

export type RequestZodSchemaType = {
  params?: ZodObjectWithEffect;
  query?: ZodObjectWithEffect;
  body?: ZodSchema;
};
