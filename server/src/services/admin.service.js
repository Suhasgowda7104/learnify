import db from '../models/index.js';
import { Op } from 'sequelize';

const { Course, User, Enrollment, CourseContent, sequelize } = db;

class AdminService {
  // Create a new course
  async createCourse(courseData) {
    const transaction = await sequelize.transaction();
    
    try {
      // Create the course
      const course = await Course.create({
        title: courseData.title,
        description: courseData.description,
        category: courseData.category,
        level: courseData.level,
        price: courseData.price,
        durationHours: courseData.durationHours,
        thumbnail: courseData.thumbnail,
        isActive: courseData.isActive !== undefined ? courseData.isActive : true
      }, { transaction });

      // Create course content if provided
      if (courseData.courseContent && courseData.courseContent.length > 0) {
        const courseContentData = courseData.courseContent.map(content => ({
          courseId: course.id,
          title: content.title,
          contentType: content.contentType,
          filePath: content.filePath || null
        }));

        await CourseContent.bulkCreate(courseContentData, { transaction });
      }

      await transaction.commit();
      
      // Return course with content
      const courseWithContent = await Course.findByPk(course.id, {
        include: [{
          model: CourseContent,
          as: 'contents'
        }]
      });
      
      return courseWithContent;
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Failed to create course: ${error.message}`);
    }
  }

  // Update an existing course
  async updateCourse(courseId, updateData) {
    const transaction = await sequelize.transaction();
    
    try {
      const course = await Course.findByPk(courseId);
      if (!course) {
        throw new Error('Course not found');
      }

      // Update course basic fields
      const { courseContent, ...courseFields } = updateData;
      await course.update(courseFields, { transaction });

      // Handle course content updates if provided
      if (courseContent !== undefined) {
        // Delete existing course content
        await CourseContent.destroy({
          where: { courseId: courseId },
          transaction
        });

        // Create new course content if provided
        if (courseContent && courseContent.length > 0) {
          const courseContentData = courseContent.map(content => ({
            courseId: courseId,
            title: content.title,
            contentType: content.contentType,
            filePath: content.filePath || null
          }));

          await CourseContent.bulkCreate(courseContentData, { transaction });
        }
      }

      await transaction.commit();
      
      // Return updated course with content
      const updatedCourse = await Course.findByPk(courseId, {
        include: [{
          model: CourseContent,
          as: 'contents'
        }]
      });
      
      return updatedCourse;
    } catch (error) {
      await transaction.rollback();
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