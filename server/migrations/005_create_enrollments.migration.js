import { query } from '../config/database.config.js';

export const up = async () => {
  const createEnrollmentsTable = `
    CREATE TABLE IF NOT EXISTS enrollments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status VARCHAR(20) DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'completed')),
      completion_date TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(student_id, course_id)
    );
  `;
  
  await query(createEnrollmentsTable);
  
  // Create indexes for better performance
  const createIndexes = `
    CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON enrollments(student_id);
    CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);
    CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(status);
    CREATE INDEX IF NOT EXISTS idx_enrollments_enrollment_date ON enrollments(enrollment_date);
  `;
  
  await query(createIndexes);
  
  console.log('✅ Enrollments table created with indexes');
};

export const down = async () => {
  await query('DROP TABLE IF EXISTS enrollments CASCADE;');
  console.log('❌ Enrollments table dropped');
};