import type { Model } from 'mongoose';

export type AdminResource = {
  name: string;
  label?: string;
  model: Model<any>;
  fields?: string[];
  readOnlyFields?: string[];
  fileFields?: string[]; // fields that should be uploaded via multipart; values stored as URL strings
  // Display field for this resource (used as label in relation lookups)
  displayField?: string;
};

export type AdminField = {
  path: string;
  type: string;
  required: boolean;
  enumValues?: string[];
  isArray?: boolean;
  // Present when type === 'relation'
  relation?: {
    // Mongoose modelName of the referenced model
    model: string;
    // Admin resource name of the referenced resource
    resource: string;
    // Field to display as label for the referenced resource
    displayField: string;
  };
  // Present when type === 'subdocument'
  children?: AdminField[];
};
