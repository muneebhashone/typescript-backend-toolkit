import type { Model } from 'mongoose';

export type AdminResource = {
  name: string;
  label?: string;
  model: Model<any>;
  fields?: string[];
  readOnlyFields?: string[];
};

export type AdminField = {
  path: string;
  type: string;
  required: boolean;
  enumValues?: string[];
  isArray?: boolean;
};
