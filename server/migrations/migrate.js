import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sequelize } from '../config/database.config.js';
import { testConnection } from '../config/database.config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create migrations tracking table
const createMigrationsTable = async () => {
  const createTable = `
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) UNIQUE NOT NULL,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await sequelize.query(createTable);
};

// Get executed migrations
const getExecutedMigrations = async () => {
  try {
    const result = await sequelize.query('SELECT filename FROM migrations ORDER BY filename;', { type: sequelize.QueryTypes.SELECT });
    return result.map(row => row.filename);
  } catch (error) {
    return [];
  }
};

// Mark migration as executed
const markMigrationExecuted = async (filename) => {
  await sequelize.query('INSERT INTO migrations (filename) VALUES ($1);', { bind: [filename] });
};

// Get all migration files
const getMigrationFiles = () => {
  const files = fs.readdirSync(__dirname)
    .filter(file => file.endsWith('.migration.js'))
    .sort();
  return files;
};

// Run migrations
const runMigrations = async () => {
  try {
    console.log('🚀 Starting database migrations...');
    console.log('Current working directory:', process.cwd());
    console.log('Migration directory:', __dirname);
    
    // Test database connection
    const connected = await testConnection();
    if (!connected) {
      console.error('❌ Database connection failed. Please check your configuration.');
      process.exit(1);
    }
    
    // Create migrations table
    await createMigrationsTable();
    
    // Get executed migrations
    const executedMigrations = await getExecutedMigrations();
    console.log(`📋 Found ${executedMigrations.length} executed migrations`);
    
    // Get all migration files
    const migrationFiles = getMigrationFiles();
    console.log(`📁 Found ${migrationFiles.length} migration files`);
    
    // Find pending migrations
    const pendingMigrations = migrationFiles.filter(file => !executedMigrations.includes(file));
    
    if (pendingMigrations.length === 0) {
      console.log('✅ All migrations are up to date!');
      return;
    }
    
    console.log(`⏳ Running ${pendingMigrations.length} pending migrations...`);
    
    // Execute pending migrations
    for (const filename of pendingMigrations) {
      try {
        console.log(`\n🔄 Executing: ${filename}`);
        
        const migrationPath = path.join(__dirname, filename);
        const migrationUrl = `file:///${migrationPath.replace(/\\/g, '/')}`;
        const migration = await import(migrationUrl);
        
        if (typeof migration.up !== 'function') {
          throw new Error(`Migration ${filename} does not export an 'up' function`);
        }
        
        await migration.up();
        await markMigrationExecuted(filename);
        
        console.log(`✅ Completed: ${filename}`);
      } catch (error) {
        console.error(`❌ Failed to execute ${filename}:`, error.message);
        process.exit(1);
      }
    }
    
    console.log('\n🎉 All migrations completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration process failed:', error.message);
    process.exit(1);
  }
};

// Run migrations if this file is executed directly
console.log('Script starting...');
console.log('import.meta.url:', import.meta.url);
console.log('process.argv[1]:', process.argv[1]);

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Condition matched, running migrations...');
  runMigrations();
} else {
  console.log('Condition not matched, not running migrations');
  runMigrations(); // Run anyway for debugging
}

export { runMigrations };