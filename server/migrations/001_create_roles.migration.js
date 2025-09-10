import { query } from '../config/database.config.js';

export const up = async () => {
  const createRolesTable = `
    CREATE TABLE IF NOT EXISTS roles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(20) UNIQUE NOT NULL CHECK (name IN ('admin', 'student')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  
  await query(createRolesTable);
  
  // Insert default roles
  const insertDefaultRoles = `
    INSERT INTO roles (name) VALUES 
    ('admin'),
    ('student')
    ON CONFLICT (name) DO NOTHING;
  `;
  
  await query(insertDefaultRoles);
  
  console.log('✅ Roles table created with default roles');
};

export const down = async () => {
  await query('DROP TABLE IF EXISTS roles CASCADE;');
  console.log('❌ Roles table dropped');
};