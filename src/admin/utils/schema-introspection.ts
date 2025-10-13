import type { Model } from 'mongoose';
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
  const schema = model.schema;
  const fields: AdminField[] = [];
  for (const [path, schemaType] of Object.entries(schema.paths)) {
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

    // Detect relations
    let refModelName: string | undefined;
    if (options && options.ref && (instance === 'ObjectId' || instance === 'ObjectID')) {
      refModelName = String(options.ref);
    } else if (isArray) {
      const caster: any = (schemaType as any).caster || (schemaType as any).$embeddedSchemaType;
      if (caster && (caster.instance === 'ObjectId' || caster.instance === 'ObjectID') && caster.options && caster.options.ref) {
        refModelName = String(caster.options.ref);
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
  const searchables = fields.filter((f) => f.type === 'string').map((f) => f.path);
  if (!searchables.length) return {};
  return {
    $or: searchables.map((p) => ({ [p]: { $regex: q, $options: 'i' } })),
  } as Record<string, unknown>;
}

function guessDisplayField() {
  return 'name';
}
