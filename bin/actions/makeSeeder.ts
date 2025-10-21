import path from 'path';
import fs from 'fs/promises';
import { introspectModel } from '../utils/introspectModel';

function pascalCase(str: string) {
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^(.)/, (m) => m.toUpperCase());
}

export const createMakeSeederAction = async (
  fullName: string,
  opts?: { count?: string; unique?: string; 'depends-on'?: string; model?: string },
) => {
  try {
    const [module, rawName] = String(fullName).split('/');
    const base = rawName.replace(/Seeder$/i, '');
    const seederName = rawName.endsWith('Seeder') ? rawName : `${base}Seeder`;
    const baseName = base.toLowerCase();

    const info = await introspectModel(module, baseName, { modelExport: opts?.model });

    const seedCount = Number(opts?.count ?? 5);
    const uniqueField = opts?.unique || info.fields.find((f) => f.unique)?.path;

    const refFields = info.fields.filter((f) => f.refModelName && !f.isArray);
    const dependsOnAuto = refFields.map((f) => `${f.refModelName}Seeder`);
    const dependsOnManual = (opts?.['depends-on'] || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const dependsOn = Array.from(new Set([...dependsOnAuto, ...dependsOnManual]));

    // Pick a primary string field for detecting existing fixtures
    const primaryStrField = ['name', 'email', 'username', 'title', 'description']
      .map((n) => info.fields.find((f) => f.path === n && f.type === 'string'))
      .find(Boolean) || info.fields.find((f) => f.type === 'string');

    // Build override for a single ref if available using ctx.refs
    const refOverrideCode = refFields.length
      ? `{
        ${refFields
          .map((f) => `${f.path}: (ctx.refs.has('${String(f.refModelName).toLowerCase()}:seeded') ? ctx.refs.get<string[]>('${String(f.refModelName).toLowerCase()}:seeded')[0] : undefined) as any`)
          .join(',\n        ')}
      }`
      : '{}';

    const seederLines: string[] = [];
    seederLines.push(`import type { Seeder } from '@/seeders/types';`);
    seederLines.push(`import ${info.modelExport === 'default' ? `${info.modelName}` : `{ ${info.modelExport} as ${info.modelName} }`} from '../${baseName}.model';`);
    seederLines.push(`import { ${baseName}Factory } from '../factories/${baseName}.factory';`);
    seederLines.push('');
    seederLines.push(`export const ${seederName}: Seeder = {`);
    seederLines.push(`  name: '${seederName}',`);
    seederLines.push(`  groups: ['base','dev','test'],`);
    seederLines.push(`  dependsOn: ${JSON.stringify(dependsOn)},`);
    seederLines.push(`  collections: [${info.modelName}.collection.collectionName],`);
    seederLines.push('  async run(ctx) {');
    if (uniqueField) {
      const uniqVal = primaryStrField?.path === 'email' ? `'${baseName}0@example.com'` : `'${pascalCase(baseName)} 0'`;
      seederLines.push(`    const existing = await ${info.modelName}.findOne({ ${uniqueField}: ${uniqVal} });`);
      seederLines.push('    if (!existing) {');
      seederLines.push(`      await ${baseName}Factory.create(0, { ${uniqueField}: ${uniqVal} });`);
      seederLines.push('    }');
    }
    seederLines.push(`    if (ctx.env.group === 'dev' || ctx.env.group === 'test') {`);
    if (primaryStrField) {
      let regex: string;
      if (primaryStrField.path === 'email') {
        regex = `^${primaryStrField.path}\\d+@example\\.com$`;
      } else if (primaryStrField.path === 'name' || primaryStrField.path === 'title' || primaryStrField.path === 'description' || primaryStrField.path === 'username') {
        regex = `^${pascalCase(primaryStrField.path)} \\d+$`;
      } else {
        regex = `^${primaryStrField.path}\\d+$`;
      }
      seederLines.push(`      const existing = await ${info.modelName}.countDocuments({ ${primaryStrField.path}: { $regex: /${regex}/ } });`);
    } else {
      seederLines.push(`      const existing = await ${info.modelName}.estimatedDocumentCount();`);
    }
    seederLines.push('      if (existing === 0) {');
    seederLines.push(`        const docs = await ${baseName}Factory.createMany(${seedCount}, ${refOverrideCode});`);
    seederLines.push(`        ctx.refs.set('${baseName}:seeded', docs.map((d: any) => String(d._id)));`);
    seederLines.push('      } else {');
    seederLines.push(`        const ids = (await ${info.modelName}.find({}).select('_id').lean()).map((d: any) => String(d._id));`);
    seederLines.push(`        ctx.refs.set('${baseName}:seeded', ids);`);
    seederLines.push('      }');
    seederLines.push('    }');
    seederLines.push('  },');
    seederLines.push('};');

    const content = seederLines.join('\n');

    const outputPath = path.join(
      process.cwd(),
      'src',
      'modules',
      module,
      'seeders',
    );
    const filePath = path.join(outputPath, `${seederName}.ts`);

    await fs.mkdir(outputPath, { recursive: true });
    await fs.writeFile(filePath, content, 'utf-8');
    console.log(`✓ Seeder created: ${filePath}`);
  } catch (error) {
    console.error('Failed to create seeder:', error);
    process.exit(1);
  }
};
