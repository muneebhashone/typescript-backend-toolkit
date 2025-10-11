### Create a module-tied seeder + factory (tbk CLI)

- **Purpose**: Scaffold a seeder and its factory for a module, register it, and seed data.

#### Inputs

- **module**: existing module folder in `src/modules/` (e.g., `user`)
- **name**: base name used for both factory and seeder (CLI appends `Seeder`)

#### Generate (factory + seeder)

```bash
# 1) Factory (used inside the seeder)
pnpm tbk make:factory <module>/<Name>

# 2) Seeder (will import and use the factory)
pnpm tbk make:seeder <module>/<Name>

# examples
# pnpm tbk make:factory payment/Payment && pnpm tbk make:seeder payment/Payment
# pnpm tbk make:factory user/User && pnpm tbk make:seeder user/User
```

This creates:

- `src/modules/<module>/factories/<name>.factory.ts` (lowercased file; exports `<camelName>Factory`)
- `src/modules/<module>/seeders/<Name>Seeder.ts`

#### Use the factory inside the seeder

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

- Replace `<Model>` with your module's mongoose model (e.g., `Payment`).
- Replace `<camelName>`/`<name>` with the factory export/file (e.g., `paymentFactory`/`payment`).
- Replace `<collection_name>` with the underlying collection name.

#### Register (required)

Add your seeder to `src/seeders/DatabaseSeeder.ts`:

```ts
import { <Name>Seeder } from '../modules/<module>/seeders/<Name>Seeder';

export const seeders = [
  // existing seeders...
  <Name>Seeder,
];
```

#### Run seeders

```bash
# default: group=dev, transactions enabled
pnpm tbk seed

# choose group
docker compose up -d
pnpm tbk seed --group dev
pnpm tbk seed --group test
pnpm tbk seed --group demo

# run specific seeders only (comma-separated names)
pnpm tbk seed --only <Name>Seeder,OtherSeeder

# drop involved collections before seeding (uses each seeder's `collections`)
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

#### Notes

- Use `dependsOn` to order seeders (names must match other seeders' `name`).
- Factories live in `src/modules/<module>/factories/` and export `<camelName>Factory` with a `build(i, overrides)` helper.
- Ensure MongoDB is reachable before seeding.
