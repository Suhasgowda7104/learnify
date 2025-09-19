import db from '../models/index.js';

const { Course, User, Enrollment, sequelize } = db;

/**
 * Student Service - Contains all student-related business logic
 */
class StudentService {
  /**
   * Get all active courses for browsing
   * @returns {Array} List of active courses
   */
  async getAllActiveCourses() {
    return await Course.findAll({
      where: { isActive: true },
      attributes: ['id', 'title', 'description', 'price', 'durationHours', 'created_at'],
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Get course details by ID
   * @param {string} courseId - Course ID
   * @returns {Object|null} Course data or null if not found
   */
  async getCourseById(courseId) {
    return await Course.findOne({
      where: { 
        id: courseId,
        isActive: true 
      },
      attributes: ['id', 'title', 'description', 'price', 'durationHours', 'created_at']
    });
  }

  /**
   * Enroll student in a course
   * @param {string} studentId - Student user ID
   * @param {string} courseId - Course ID
   * @returns {Object} Enrollment data
   */
  
}

// Export singleton instance
export default new StudentService();