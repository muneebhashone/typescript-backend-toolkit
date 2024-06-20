import { db, connection } from './src/drizzle/db';
import { migrate } from 'drizzle-orm/postgres-js/migrator';

(async () => {
  console.log('Migration started...');
  await migrate(db, {
    migrationsFolder: './migrations',
  });
  console.log('Migration done...');
})()
  .then()
  .catch((err) => {
    console.log(err?.message);
  })
  .finally(async () => await connection.end());
