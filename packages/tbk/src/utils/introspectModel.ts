import path from 'path';
import fs from 'fs/promises';

export type FieldInfo = {
  path: string;
  type: string; // string|number|boolean|date|objectId|array|subdocument|mixed
  required: boolean;
  enumValues?: string[];
  isArray?: boolean;
  refModelName?: string;
  unique?: boolean;
};

export type ModelInfo = {
  modelName: string;
  modelExport: string; // variable to import
  modelFilePath: string; // absolute
  dtoFilePath?: string; // absolute if exists
  servicesFilePath?: string; // absolute if exists
  fields: FieldInfo[];
};

function pascalCase(str: string) {
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^(.)/, (m) => m.toUpperCase());
}

export async function resolveModulePaths(moduleName: string, baseName: string) {
  const projectRoot = process.cwd();
  const moduleDir = path.join(projectRoot, 'src', 'modules', moduleName);
  const modelFilePath = path.join(moduleDir, `${baseName}.model.ts`);
  const dtoFilePath = path.join(moduleDir, `${baseName}.dto.ts`);
  const servicesFilePath = path.join(moduleDir, `${baseName}.services.ts`);
  return {
    moduleDir,
    modelFilePath,
    dtoFilePath: await exists(dtoFilePath) ? dtoFilePath : undefined,
    servicesFilePath: await exists(servicesFilePath) ? servicesFilePath : undefined,
  };
}

async function exists(p: string) {
  try {
    await fs.stat(p);
    return true;
  } catch {
    return false;
  }
}

export async function introspectModel(
  moduleName: string,
  baseName: string,
  options?: { modelExport?: string },
): Promise<ModelInfo> {
  const { modelFilePath, dtoFilePath, servicesFilePath } = await resolveModulePaths(
    moduleName,
    baseName,
  );

  const { pathToFileURL } = await import('url');
  // Dynamic import of the TS file via tsx runtime using file URL
  const mod = await import(pathToFileURL(modelFilePath).href);

  const exportName = options?.modelExport || 'default';
  const model: any = exportName === 'default' ? mod.default : mod[exportName];
  if (!model || !model.schema) {
    throw new Error(`Could not load model from ${modelFilePath}. Export: ${exportName}`);
  }

  const fields: FieldInfo[] = [];
  const schemaPaths = (model.schema as any).paths || {};
  for (const [p, schemaType] of Object.entries<any>(schemaPaths)) {
    if (p === '__v') continue;
    const instance: string | undefined = schemaType.instance;
    const optionsObj: any = schemaType.options || {};
    const enumValues: string[] | undefined = optionsObj.enum;
    let required = false;
    try {
      required = typeof schemaType.isRequired === 'function' ? !!schemaType.isRequired() : !!optionsObj.required;
    } catch {
      required = !!optionsObj.required;
    }
    const unique = !!optionsObj.unique;
    let type = (instance || 'mixed').toLowerCase();
    const isArray = instance === 'Array';
    let refModelName: string | undefined;

    // Detect refs (single)
    if (
      optionsObj &&
      optionsObj.ref &&
      (instance === 'ObjectId' || instance === 'ObjectID')
    ) {
      refModelName = String(optionsObj.ref);
      type = 'objectid';
    }

    // Arrays
    const caster: any = schemaType.caster || schemaType.$embeddedSchemaType;
    if (isArray) {
      if (caster && caster.options && caster.options.ref && (caster.instance === 'ObjectId' || caster.instance === 'ObjectID')) {
        refModelName = String(caster.options.ref);
        type = 'objectid';
      } else if (caster && caster.instance) {
        type = String(caster.instance).toLowerCase();
      } else {
        type = 'array';
      }
    }

    fields.push({ path: p, type, required, enumValues, isArray, refModelName, unique });
  }

  const modelExport = options?.modelExport || 'default';
  const modelName = model.modelName || pascalCase(baseName);

  return {
    modelName,
    modelExport,
    modelFilePath,
    dtoFilePath,
    servicesFilePath,
    fields,
  };
}

export function findCreateFunctionName(baseName: string, servicesSource: string): string | undefined {
  const pascal = pascalCase(baseName);
  const candidates = [
    `export const create${pascal}`,
    `export function create${pascal}`,
  ];
  for (const c of candidates) {
    if (servicesSource.includes(c)) return `create${pascal}`;
  }
  return undefined;
}
