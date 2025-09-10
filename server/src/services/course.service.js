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
   * @param {string} courseData.instructorId - Instructor's user ID
   * @returns {Object} Created course data
   */
  async createCourse(courseData) {
    const { title, description, instructorId } = courseData;

    // Validate required fields
    if (!title || !description || !instructorId) {
      throw new Error('Title, description, and instructor ID are required');
    }

    // Verify instructor exists and has admin role
    const instructor = await User.findByPk(instructorId, {
      include: [{
        model: Role,
        as: 'role',
        attributes: ['name']
      }]
    });

    if (!instructor) {
      throw new Error('Instructor not found');
    }

    if (instructor.role.name !== 'admin') {
      throw new Error('Only admin users can create courses');
    }

    // Create new course
    const newCourse = await Course.create({
      title,
      description,
      instructorId,
      isActive: true
    });

    return newCourse;
  }

  /**
   * Get all active courses
   * @returns {Array} List of active courses with instructor info
   */
  async getAllActiveCourses() {
    return await Course.findAll({
      where: { isActive: true },
      include: [{
        model: User,
        as: 'instructor',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }],
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * Get course by ID
   * @param {string} courseId - Course ID
   * @returns {Object|null} Course data with instructor info or null if not found
   */
  async getCourseById(courseId) {
    return await Course.findByPk(courseId, {
      include: [{
        model: User,
        as: 'instructor',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }]
    });
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

    // Verify requester is the instructor or admin
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

    const isInstructor = course.instructorId === requesterId;
    const isAdmin = requester.role.name === 'admin';

    if (!isInstructor && !isAdmin) {
      throw new Error('Only the course instructor or admin can update this course');
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
   * Get courses by instructor
   * @param {string} instructorId - Instructor's user ID
   * @returns {Array} List of courses by instructor
   */
  async getCoursesByInstructor(instructorId) {
    return await Course.findAll({
      where: { instructorId },
      include: [{
        model: User,
        as: 'instructor',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }],
      order: [['createdAt', 'DESC']]
    });
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
      include: [{
        model: User,
        as: 'instructor',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }],
      order: [['createdAt', 'DESC']]
    });
  }
}

// Export singleton instance
export default new CourseService();