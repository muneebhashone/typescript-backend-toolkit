import type { Model, Schema as MongooseSchema } from 'mongoose';
import type { AdminField } from '../types';
import { getResourceByModelName } from '../registry';

function mapType(instance?: string): string {
  switch (instance) {
    case 'String':
      return 'string';
    case 'Number':
      return 'number';
    case 'Boolean':
      return 'boolean';
    case 'Date':
      return 'date';
    case 'ObjectId':
    case 'ObjectID':
      return 'objectId';
    case 'Array':
      return 'array';
    case 'Mixed':
    case 'Map':
      return 'mixed';
    default:
      return (instance || 'mixed').toLowerCase();
  }
}

export function getFields(model: Model<any>, only?: string[]): AdminField[] {
  return extractFieldsFromSchema(model.schema, only, 0);
}

function extractFieldsFromSchema(
  schema: MongooseSchema<any>,
  only: string[] | undefined,
  depth: number,
): AdminField[] {
  const fields: AdminField[] = [];
  if (depth > 3) return fields; // avoid deep recursion
  for (const [path, schemaType] of Object.entries((schema as any).paths)) {
    if (path === '__v') continue;
    if (only && only.length && !only.includes(path)) continue;
    const instance = (schemaType as any).instance as string | undefined;
    const options = (schemaType as any).options || {};
    const enumValues: string[] | undefined = options.enum;
    let required = false;
    try {
      required = typeof (schemaType as any).isRequired === 'function' ? !!(schemaType as any).isRequired() : !!options.required;
    } catch {
      required = !!options.required;
    }
    const isArray = instance === 'Array';

    // Array of subdocuments (DocumentArrayPath) — detect before single to avoid misclassification
    const caster: any = (schemaType as any).caster || (schemaType as any).$embeddedSchemaType;
    const maybeSubArraySchema: MongooseSchema<any> | undefined = caster?.schema || (isArray ? (schemaType as any).schema : undefined);
    if (isArray && maybeSubArraySchema) {
      const children = extractFieldsFromSchema(maybeSubArraySchema, undefined, depth + 1);
      fields.push({
        path,
        type: 'subdocument',
        required,
        enumValues,
        isArray: true,
        children,
      });
      continue;
    }

    // Subdocument (single)
    const subSchema: MongooseSchema<any> | undefined = (schemaType as any).schema;
    if (subSchema) {
      const children = extractFieldsFromSchema(subSchema, undefined, depth + 1);
      fields.push({
        path,
        type: 'subdocument',
        required,
        enumValues,
        isArray: false,
        children,
      });
      continue;
    }

    // Detect relations
    let refModelName: string | undefined;
    if (options && options.ref && (instance === 'ObjectId' || instance === 'ObjectID')) {
      refModelName = String(options.ref);
    } else if (isArray) {
      const casterForRef: any = (schemaType as any).caster || (schemaType as any).$embeddedSchemaType;
      if (
        casterForRef &&
        (casterForRef.instance === 'ObjectId' || casterForRef.instance === 'ObjectID') &&
        casterForRef.options &&
        casterForRef.options.ref
      ) {
        refModelName = String(casterForRef.options.ref);
      }
    }

    if (refModelName) {
      const res = getResourceByModelName(refModelName);
      const displayField = res?.displayField || guessDisplayField();
      fields.push({
        path,
        type: 'relation',
        required,
        enumValues,
        isArray,
        relation: res
          ? {
              model: refModelName,
              resource: res.name,
              displayField,
            }
          : undefined,
      });
      continue;
    }

    fields.push({
      path,
      type: mapType(instance),
      required,
      enumValues,
      isArray,
    });
  }
  return fields;
}

export function buildSearchQuery(q: string | undefined, fields: AdminField[]) {
  if (!q) return {};
  const searchables: string[] = [];
  const walk = (fs: AdminField[], prefix?: string) => {
    for (const f of fs) {
      const full = prefix ? `${prefix}.${f.path}` : f.path;
      if (f.type === 'string') searchables.push(full);
      if (f.type === 'subdocument' && Array.isArray(f.children) && f.children.length) {
        walk(f.children, full);
      }
    }
  };
  walk(fields);
  if (!searchables.length) return {};
  return {
    $or: searchables.map((p) => ({ [p]: { $regex: q, $options: 'i' } })),
  } as Record<string, unknown>;
}

function guessDisplayField() {
  return 'name';
}
