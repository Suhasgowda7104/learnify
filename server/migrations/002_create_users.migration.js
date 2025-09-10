import { query } from '../config/database.config.js';

export const up = async () => {
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      role_id UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  
  await query(createUsersTable);
  
  // Create indexes for better performance
  const createIndexes = `
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
    CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
  `;
  
  await query(createIndexes);
  
  console.log('✅ Users table created with indexes');
};

export const down = async () => {
  await query('DROP TABLE IF EXISTS users CASCADE;');
  console.log('❌ Users table dropped');
};