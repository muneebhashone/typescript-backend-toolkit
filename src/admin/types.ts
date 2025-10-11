import type { Model } from 'mongoose';

export type AdminResource = {
  name: string;
  label?: string;
  model: Model<any>;
  fields?: string[];
  readOnlyFields?: string[];
  fileFields?: string[]; // fields that should be uploaded via multipart; values stored as URL strings
};

export type AdminField = {
  path: string;
  type: string;
  required: boolean;
  enumValues?: string[];
  isArray?: boolean;
};
