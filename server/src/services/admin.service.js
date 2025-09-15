import db from '../models/index.js';
import { Op } from 'sequelize';

const { Course, User, Enrollment, sequelize } = db;

class AdminService {
  // Create a new course
  async createCourse(courseData) {
    try {
      const course = await Course.create({
        title: courseData.title,
        description: courseData.description,
        category: courseData.category,
        level: courseData.level,
        price: courseData.price,
        duration: courseData.duration,
        thumbnail: courseData.thumbnail,
        is_active: courseData.is_active !== undefined ? courseData.is_active : true
      });
      return course;
    } catch (error) {
      throw new Error(`Failed to create course: ${error.message}`);
    }
  }

  // Update an existing course
  async updateCourse(courseId, updateData) {
    try {
      const course = await Course.findByPk(courseId);
      if (!course) {
        throw new Error('Course not found');
      }

      await course.update(updateData);
      return course;
    } catch (error) {
      throw new Error(`Failed to update course: ${error.message}`);
    }
  }

  // Delete a course
  async deleteCourse(courseId) {
    try {
      const course = await Course.findByPk(courseId);
      if (!course) {
        throw new Error('Course not found');
      }

      // Check if there are any enrollments
      const enrollmentCount = await Enrollment.count({
        where: { course_id: courseId }
      });

      if (enrollmentCount > 0) {
        // Soft delete by setting is_active to false
        await course.update({ is_active: false });
        return { message: 'Course deactivated due to existing enrollments', course };
      } else {
        // Hard delete if no enrollments
        await course.destroy();
        return { message: 'Course deleted successfully' };
      }
    } catch (error) {
      throw new Error(`Failed to delete course: ${error.message}`);
    }
  }

  // Get all courses with enrollment counts
  async getAllCoursesWithEnrollmentCounts() {
    try {
      const courses = await Course.findAll({
        attributes: {
          include: [
            [
              sequelize.fn('COUNT', sequelize.col('enrollments.id')),
              'enrollment_count'
            ]
          ]
        },
        include: [
          {
            model: Enrollment,
            as: 'enrollments',
            attributes: [],
            required: false
          }
        ],
        group: ['Course.id'],
        order: [['created_at', 'DESC']]
      });
      return courses;
    } catch (error) {
      throw new Error(`Failed to fetch courses: ${error.message}`);
    }
  }

  // Get students enrolled in a specific course
  async getEnrollmentsByCourse(courseId) {
    try {
      const course = await Course.findByPk(courseId);
      if (!course) {
        throw new Error('Course not found');
      }

      const enrollments = await Enrollment.findAll({
        where: { course_id: courseId },
        include: [
          {
            model: User,
            attributes: ['id', 'first_name', 'last_name', 'email', 'created_at'],
            include: [
              {
                model: db.Role,
                attributes: ['name']
              }
            ]
          },
          {
            model: Course,
            attributes: ['id', 'title']
          }
        ],
        order: [['enrolled_at', 'DESC']]
      });

      return {
        course: {
          id: course.id,
          title: course.title,
          description: course.description
        },
        enrollments: enrollments.map(enrollment => ({
          id: enrollment.id,
          enrolled_at: enrollment.enrolled_at,
          progress: enrollment.progress,
          completed_at: enrollment.completed_at,
          student: {
            id: enrollment.User.id,
            first_name: enrollment.User.first_name,
            last_name: enrollment.User.last_name,
            email: enrollment.User.email,
            role: enrollment.User.Role?.name,
            joined_at: enrollment.User.created_at
          }
        })),
        total_enrollments: enrollments.length
      };
    } catch (error) {
      throw new Error(`Failed to fetch enrollments: ${error.message}`);
    }
  }

  // Get course statistics
  async getCourseStats() {
    try {
      const totalCourses = await Course.count();
      const activeCourses = await Course.count({ where: { is_active: true } });
      const totalEnrollments = await Enrollment.count();
      const totalStudents = await User.count({
        include: [
          {
            model: db.Role,
            where: { name: 'student' }
          }
        ]
      });

      return {
        total_courses: totalCourses,
        active_courses: activeCourses,
        total_enrollments: totalEnrollments,
        total_students: totalStudents
      };
    } catch (error) {
      throw new Error(`Failed to fetch course statistics: ${error.message}`);
    }
  }
}

export default new AdminService();