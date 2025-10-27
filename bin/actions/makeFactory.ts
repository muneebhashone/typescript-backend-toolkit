import path from 'path';
import fs from 'fs/promises';
import { introspectModel, findCreateFunctionName, resolveModulePaths, type FieldInfo } from '../utils/introspectModel';

function pascalCase(str: string) {
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^(.)/, (m) => m.toUpperCase());
}

function defaultValueForField(f: FieldInfo, iVar = 'i'): string {
  const name = f.path;
  const idx = iVar;
  if (name === '_id') {
    if (f.type === 'string') return "new Types.ObjectId().toString()";
    if (f.type === 'objectid') return 'new Types.ObjectId() as any';
  }
  if (f.enumValues && f.enumValues.length) {
    return `${JSON.stringify(f.enumValues)}[(${idx}-1) % ${f.enumValues.length}]`;
  }
  if (f.refModelName) return 'new Types.ObjectId() as any';
  switch (f.type) {
    case 'string': {
      if (/email/i.test(name)) return '`'+name+'${'+idx+'}@example.com`';
      if (/username/i.test(name)) return '`'+name+'${'+idx+'}`';
      if (/password/i.test(name)) return '`password${'+idx+'}`';
      if (/name/i.test(name)) return '`'+pascalCase(name)+' ${'+idx+'}`';
      if (/description/i.test(name)) return '`Description ${'+idx+'}`';
      if (/url|avatar/i.test(name)) return '`https://example.com/'+name+'/${'+idx+'}`';
      return '`'+name+'${'+idx+'}`';
    }
    case 'number':
      return idx;
    case 'boolean':
      return `(${idx} % 2 === 0)`;
    case 'date':
      return 'new Date()';
    case 'array':
      return '[] as any[]';
    case 'objectid':
      return 'new Types.ObjectId() as any';
    default:
      return 'undefined as any';
  }
}

export const createMakeFactoryAction = async (fullName: string, opts?: { model?: string; use?: 'service'|'model'; 'id-type'?: string }) => {
  try {
    const [module, rawName] = String(fullName).split('/');
    const baseName = rawName.replace(/\.factory$/i, '');
    const factoryVar = `${baseName.charAt(0).toLowerCase()}${baseName.slice(1)}Factory`;

    const info = await introspectModel(module, baseName, { modelExport: opts?.model });
    const _hasObjectId = info.fields.some((f) => f.type === 'objectid' || f.refModelName);

    // DTO/service checks
    const dtoTypeModel = `${pascalCase(baseName)}ModelType`;
    const dtoTypeOut = `${pascalCase(baseName)}Type`;
    let useDTO = false;
    if (info.dtoFilePath) {
      const dtoSrc = await fs.readFile(info.dtoFilePath, 'utf-8');
      useDTO = dtoSrc.includes(`export type ${dtoTypeModel}`) || dtoSrc.includes(`export interface ${dtoTypeModel}`);
    }

    const { servicesFilePath } = await resolveModulePaths(module, baseName);
    let createFnName: string | undefined;
    if (servicesFilePath) {
      const serviceSrc = await fs.readFile(servicesFilePath, 'utf-8');
      createFnName = findCreateFunctionName(baseName, serviceSrc);
    }

    const buildFields: string[] = [];
    for (const f of info.fields) {
      // skip internal
      if (f.path === '__v' || f.path === 'createdAt' || f.path === 'updatedAt') continue;
      // include required fields and common optional initials (name/description/email)
      const shouldInclude = f.required || /^(name|email|username|description|title|password|avatar|url|role)$/i.test(f.path) || f.path === '_id';
      if (!shouldInclude) continue;
      buildFields.push(`      ${JSON.stringify(f.path).replace(/"/g,'')}: ${defaultValueForField(f)}`);
    }

    const payloadType = useDTO ? `${dtoTypeModel}` : 'Record<string, any>';
    const returnType = useDTO ? `${dtoTypeOut}` : 'any';

    const lines: string[] = [];
    lines.push(`import ${info.modelExport === 'default' ? '' : `{ ${info.modelExport} as ` + info.modelName + `Model } from `} '../${baseName}.model';`);
    // The above is messy; prefer default import as in repo styles
    lines.length = 0; // reset
    lines.push(`import { Types } from 'mongoose';`);
    if (!createFnName) {
      lines.push(`import ${info.modelExport === 'default' ? `${info.modelName}` : `{ ${info.modelExport} as ${info.modelName} }`} from '../${baseName}.model';`);
    }
    if (useDTO) lines.push(`import type { ${dtoTypeModel}, ${dtoTypeOut} } from '../${baseName}.dto';`);
    if (createFnName) lines.push(`import { ${createFnName} } from '../${baseName}.services';`);
    lines.push('');
    lines.push(`type Overrides = Partial<${payloadType}> & Record<string, any>;`);
    lines.push('');
    lines.push(`export const ${factoryVar} = {`);
    lines.push(`  build(i = 1, overrides: Overrides = {}): ${payloadType} {`);
    lines.push('    return {');
    if (buildFields.length) lines.push(buildFields.join(',\n'));
    lines.push('      , ...overrides');
    lines.push('    } as unknown as ' + payloadType + ';');
    lines.push('  },');
    lines.push('');
    lines.push(`  async create(i = 1, overrides: Overrides = {}): Promise<${returnType}> {`);
    lines.push('    const payload = this.build(i, overrides);');
    if (createFnName) {
      lines.push(`    // Prefer service function when available`);
      lines.push(`    return await ${createFnName}(payload as any);`);
    } else {
      lines.push(`    const doc = await ${info.modelName}.create(payload as any);`);
      lines.push('    // @ts-expect-error toObject present on mongoose doc');
      lines.push('    return (doc.toObject ? doc.toObject() : doc) as ' + returnType + ';');
    }
    lines.push('  },');
    lines.push('');
    lines.push('  async createMany(count: number, overrides: Overrides = {}): Promise<' + returnType + '[]> {');
    lines.push('    const out: ' + returnType + '[] = [];');
    lines.push('    for (let i = 1; i <= count; i += 1) out.push(await this.create(i, overrides));');
    lines.push('    return out;');
    lines.push('  },');
    lines.push('};');

    const content = lines.join('\n');

    const outputPath = path.join(
      process.cwd(),
      'src',
      'modules',
      module,
      'factories',
    );
    const filePath = path.join(outputPath, `${baseName.toLowerCase()}.factory.ts`);

    await fs.mkdir(outputPath, { recursive: true });
    await fs.writeFile(filePath, content, 'utf-8');
    console.log(`✓ Factory created: ${filePath}`);
  } catch (error) {
    console.error('Failed to create factory:', error);
    process.exit(1);
  }
};
