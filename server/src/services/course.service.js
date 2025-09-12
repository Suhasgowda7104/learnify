import db from '../models/index.js';

const { Course, User, Role } = db;

/**
 * Course Service - Contains all course-related business logic
 */
class CourseService {
  /**
   * Create a new course
   * @param {Object} courseData - Course creation data
   * @param {string} courseData.title - Course title
   * @param {string} courseData.description - Course description
   * @returns {Object} Created course data
   */
  async createCourse(courseData) {
    const { title, description } = courseData;

    // Validate required fields
    if (!title || !description) {
      throw new Error('Title and description are required');
    }

    // Create new course
    const newCourse = await Course.create({
      title,
      description,
      isActive: true
    });

    return newCourse;
  }

  /**
   * Get all active courses
   * @returns {Array} List of active courses
   */
  async getAllActiveCourses() {
    return await Course.findAll({
      where: { isActive: true },
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Get course by ID
   * @param {string} courseId - Course ID
   * @returns {Object|null} Course data or null if not found
   */
  async getCourseById(courseId) {
    return await Course.findByPk(courseId);
  }

  /**
   * Update course information
   * @param {string} courseId - Course ID
   * @param {Object} updateData - Data to update
   * @param {string} requesterId - ID of user making the request
   * @returns {Object} Updated course data
   */
  async updateCourse(courseId, updateData, requesterId) {
    const course = await this.getCourseById(courseId);
    
    if (!course) {
      throw new Error('Course not found');
    }

    // Verify requester is admin
    const requester = await User.findByPk(requesterId, {
      include: [{
        model: Role,
        as: 'role',
        attributes: ['name']
      }]
    });

    if (!requester) {
      throw new Error('Requester not found');
    }

    if (requester.role.name !== 'admin') {
      throw new Error('Only admin users can update courses');
    }

    // Update course
    await course.update(updateData);
    return await this.getCourseById(courseId);
  }

  /**
   * Delete/deactivate course
   * @param {string} courseId - Course ID
   * @param {string} requesterId - ID of user making the request
   * @returns {boolean} True if course was deactivated
   */
  async deleteCourse(courseId, requesterId) {
    const course = await this.getCourseById(courseId);
    
    if (!course) {
      throw new Error('Course not found');
    }

    // Verify requester is admin
    const requester = await User.findByPk(requesterId, {
      include: [{
        model: Role,
        as: 'role',
        attributes: ['name']
      }]
    });

    if (!requester || requester.role.name !== 'admin') {
      throw new Error('Only admin users can delete courses');
    }

    // Soft delete by setting isActive to false
    await course.update({ isActive: false });
    return true;
  }



  /**
   * Search courses by title or description
   * @param {string} searchTerm - Search term
   * @returns {Array} List of matching courses
   */
  async searchCourses(searchTerm) {
    const { Op } = require('sequelize');
    
    return await Course.findAll({
      where: {
        isActive: true,
        [Op.or]: [
          { title: { [Op.iLike]: `%${searchTerm}%` } },
          { description: { [Op.iLike]: `%${searchTerm}%` } }
        ]
      },
      order: [['created_at', 'DESC']]
    });
  }
}

// Export singleton instance
export default new CourseService();