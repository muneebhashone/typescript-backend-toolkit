# Create a module-tied seeder + factory (tbk CLI)

## Overview

Scaffold a seeder and its factory for a module, register it in the database seeder, and populate your database with test data.

## Inputs

- **module**: existing module folder in `src/modules/` (e.g., `user`)
- **name**: base name used for both factory and seeder (CLI appends `Seeder`)

## Steps

1. **Generate factory and seeder files**

   ```bash
   # 1) Factory (used inside the seeder)
   pnpm tbk make:factory <module>/<Name>

   # 2) Seeder (will import and use the factory)
   pnpm tbk make:seeder <module>/<Name>
   ```

   Examples:

   ```bash
   pnpm tbk make:factory payment/Payment && pnpm tbk make:seeder payment/Payment
   pnpm tbk make:factory user/User && pnpm tbk make:seeder user/User
   ```

   This creates:

   - `src/modules/<module>/factories/<name>.factory.ts` (lowercased file; exports `<camelName>Factory`)
   - `src/modules/<module>/seeders/<Name>Seeder.ts`

2. **Implement seeder logic**
   Edit `src/modules/<module>/seeders/<Name>Seeder.ts` to import the factory and insert documents via the module model:

   ```ts
   import <Model> from '../<module>.model';
   import { <camelName>Factory } from '../factories/<name>.factory';

   export const <Name>Seeder = {
     name: '<Name>Seeder',
     groups: ['dev'],
     // collections help --fresh drop only the affected collections
     collections: ['<collection_name>'],
     async run(ctx) {
       ctx.logger.info('Running <Name>Seeder');

       const docs = Array.from({ length: 10 }, (_, i) =>
         <camelName>Factory.build(i + 1),
       );

       if (!ctx.env.dryRun) {
         await <Model>.insertMany(docs);
       }

       // share references across seeders if needed
       ctx.refs.set('<module>:seeded', docs.map((d) => d._id));
     },
   };
   ```

   - Replace `<Model>` with your module's mongoose model (e.g., `Payment`)
   - Replace `<camelName>`/`<name>` with the factory export/file (e.g., `paymentFactory`/`payment`)
   - Replace `<collection_name>` with the underlying collection name

3. **Register seeder**
   Add your seeder to `src/seeders/DatabaseSeeder.ts`:

   ```ts
   import { <Name>Seeder } from '../modules/<module>/seeders/<Name>Seeder';

   export const seeders = [
     // existing seeders...
     <Name>Seeder,
   ];
   ```

4. **Run seeders**

   ```bash
   # default: group=dev, transactions enabled
   pnpm tbk seed

   # choose specific group
   pnpm tbk seed --group dev
   pnpm tbk seed --group test
   pnpm tbk seed --group demo

   # run specific seeders only (comma-separated names)
   pnpm tbk seed --only <Name>Seeder,OtherSeeder

   # drop involved collections before seeding
   pnpm tbk seed --fresh

   # dry run (log only, no writes)
   pnpm tbk seed --dry-run

   # set random seed value
   pnpm tbk seed --seed 42

   # disable transactions globally
   pnpm tbk seed --no-transaction

   # allow in production (blocked unless forced)
   pnpm tbk seed --force
   ```

## Seeder Checklist

- [ ] Factory file generated in `src/modules/<module>/factories/`
- [ ] Seeder file generated in `src/modules/<module>/seeders/`
- [ ] Factory implements `build(i, overrides)` method
- [ ] Seeder registered in `src/seeders/DatabaseSeeder.ts`
- [ ] Collections specified in seeder config
- [ ] MongoDB service running (`docker compose up -d`)
- [ ] Seeder tested with `--dry-run` flag

## Advanced Options

- **Order dependencies**: Use `dependsOn` to order seeders (names must match other seeders' `name`)
- **Share data**: Use `ctx.refs.set()` and `ctx.refs.get()` to pass data between seeders
- **Group targeting**: Assign seeders to groups (`dev`, `test`, `demo`) for different environments

## Notes

- Factories live in `src/modules/<module>/factories/` and export `<camelName>Factory` with a `build(i, overrides)` helper
- Ensure MongoDB is reachable before seeding (`docker compose up -d`)
- Use transactions by default for data consistency; disable with `--no-transaction` if needed
