import { query } from '../config/database.config.js';

export const up = async () => {
  const createCoursesTable = `
    CREATE TABLE IF NOT EXISTS courses (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title VARCHAR(255) NOT NULL,
      description TEXT,
      price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
      duration_hours INTEGER,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  
  await query(createCoursesTable);
  
  // Create indexes for better performance
  const createIndexes = `
    CREATE INDEX IF NOT EXISTS idx_courses_title ON courses(title);
    CREATE INDEX IF NOT EXISTS idx_courses_is_active ON courses(is_active);
    CREATE INDEX IF NOT EXISTS idx_courses_price ON courses(price);
  `;
  
  await query(createIndexes);
  
  console.log('✅ Courses table created with indexes');
};

export const down = async () => {
  await query('DROP TABLE IF EXISTS courses CASCADE;');
  console.log('❌ Courses table dropped');
};