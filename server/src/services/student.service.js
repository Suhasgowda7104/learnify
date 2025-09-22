import db from '../models/index.js';

const { Course, User, Enrollment, sequelize } = db;

class StudentService {
  async getAllActiveCourses() {
    return await Course.findAll({
      where: { isActive: true },
      attributes: ['id', 'title', 'description', 'price', 'durationHours', 'created_at'],
      order: [['created_at', 'DESC']]
    });
  }

  async getCourseById(courseId) {
    return await Course.findOne({
      where: { 
        id: courseId,
        isActive: true 
      },
      attributes: ['id', 'title', 'description', 'price', 'durationHours', 'created_at']
    });
  }  
}

export default new StudentService();