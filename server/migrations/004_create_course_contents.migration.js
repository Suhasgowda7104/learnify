import { query } from '../config/database.config.js';

export const up = async () => {
  const createCourseContentsTable = `
    CREATE TABLE IF NOT EXISTS course_contents (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('pdf', 'text')),
      file_path VARCHAR(500), -- stores path of uploaded file/doc
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  
  await query(createCourseContentsTable);
  
  // Create indexes for better performance
  const createIndexes = `
    CREATE INDEX IF NOT EXISTS idx_course_contents_course_id ON course_contents(course_id);
    CREATE INDEX IF NOT EXISTS idx_course_contents_content_type ON course_contents(content_type);
  `;
  
  await query(createIndexes);
  
  console.log('✅ Course contents table created with indexes');
};

export const down = async () => {
  await query('DROP TABLE IF EXISTS course_contents CASCADE;');
  console.log('❌ Course contents table dropped');
};