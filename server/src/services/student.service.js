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
  async enrollInCourse(studentId, courseId) {
    // Check if course exists and is active
    const course = await Course.findOne({
      where: { 
        id: courseId,
        isActive: true 
      }
    });

    if (!course) {
      throw new Error('Course not found or not available');
    }

    // Check if student exists
    const student = await User.findByPk(studentId, {
      include: [{
        model: db.Role,
        as: 'role',
        attributes: ['name']
      }]
    });

    if (!student) {
      throw new Error('Student not found');
    }

    if (student.role.name !== 'student') {
      throw new Error('Only students can enroll in courses');
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      where: {
        studentId: studentId,
        courseId: courseId
      }
    });

    if (existingEnrollment) {
      throw new Error('Already enrolled in this course');
    }

    // Create enrollment
    const enrollment = await Enrollment.create({
      studentId: studentId,
      courseId: courseId,
      status: 'enrolled'
    });

    return {
      id: enrollment.id,
      courseId: courseId,
      courseTitle: course.title,
      enrollmentDate: enrollment.enrollmentDate,
      status: enrollment.status
    };
  }

  /**
   * Get all enrollments for a student
   * @param {string} studentId - Student user ID
   * @returns {Array} List of student's enrollments
   */
  async getStudentEnrollments(studentId) {
    const enrollments = await Enrollment.findAll({
      where: { studentId: studentId },
      include: [{
        model: Course,
        as: 'course',
        attributes: ['id', 'title', 'description', 'price', 'durationHours'],
        where: { isActive: true }
      }],
      attributes: ['id', 'enrollmentDate', 'status', 'completionDate'],
      order: [['enrollmentDate', 'DESC']]
    });

    return enrollments.map(enrollment => ({
      id: enrollment.id,
      enrollmentDate: enrollment.enrollmentDate,
      status: enrollment.status,
      completionDate: enrollment.completionDate,
      course: {
        id: enrollment.course.id,
        title: enrollment.course.title,
        description: enrollment.course.description,
        price: enrollment.course.price,
        durationHours: enrollment.course.durationHours
      }
    }));
  }
}

// Export singleton instance
export default new StudentService();