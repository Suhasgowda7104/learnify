import db from '../models/index.js';

const { Course, User, Enrollment, sequelize } = db;

class AdminService {

  async createCourse(courseData) {
    try {
      const course = await Course.create({
        title: courseData.title,
        description: courseData.description,
        price: courseData.price,
        durationHours: courseData.durationHours,
        isActive: courseData.isActive !== undefined ? courseData.isActive : true
      });
      return course;
    } catch (error) {
      throw new Error(`Failed to create course: ${error.message}`);
    }
  }


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