import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from '../config/database.config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create migrations table if it doesn't exist
const createMigrationsTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await query(createTableQuery);
};

// Get executed migrations
const getExecutedMigrations = async () => {
  try {
    const result = await query('SELECT filename FROM migrations ORDER BY executed_at');
    return result.rows.map(row => row.filename);
  } catch (error) {
    return [];
  }
};

// Execute a single migration
const executeMigration = async (filename) => {
  const migrationPath = path.join(__dirname, filename);
  const migrationModule = await import(migrationPath);
  
  console.log(`Executing migration: ${filename}`);
  await migrationModule.up();
  
  // Record migration as executed
  await query('INSERT INTO migrations (filename) VALUES ($1)', [filename]);
  console.log(`✅ Migration ${filename} completed`);
};

// Run all pending migrations
const runMigrations = async () => {
  try {
    await createMigrationsTable();
    
    const migrationFiles = fs.readdirSync(__dirname)
      .filter(file => file.endsWith('.migration.js'))
      .sort();
    
    const executedMigrations = await getExecutedMigrations();
    const pendingMigrations = migrationFiles.filter(file => !executedMigrations.includes(file));
    
    if (pendingMigrations.length === 0) {
      console.log('No pending migrations');
      return;
    }
    
    console.log(`Found ${pendingMigrations.length} pending migrations`);
    
    for (const migration of pendingMigrations) {
      await executeMigration(migration);
    }
    
    console.log('All migrations completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

// Run migrations if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations();
}

export { runMigrations };