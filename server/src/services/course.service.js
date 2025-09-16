import db from '../models/index.js';

const { Course, User, Role, CourseContent } = db;

class CourseService {
  async createCourse(courseData) {
    const { title, description } = courseData;


    if (!title || !description) {
      throw new Error('Title and description are required');
    }


    const newCourse = await Course.create({
      title,
      description,
      isActive: true
    });

    return newCourse;
  }

  async getAllActiveCourses() {
    return await Course.findAll({
      where: { isActive: true },
      order: [['created_at', 'DESC']]
    });
  }

  async getCourseById(courseId) {
    return await Course.findByPk(courseId, {
      include: [{
        model: CourseContent,
        as: 'contents',
        attributes: ['id', 'title', 'contentType', 'filePath', 'created_at', 'updated_at'],
        order: [['created_at', 'ASC']]
      }]
    });
  }

  async updateCourse(courseId, updateData, requesterId) {
    const course = await this.getCourseById(courseId);
    
    if (!course) {
      throw new Error('Course not found');
    }


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


    await course.update(updateData);
    return await this.getCourseById(courseId);
  }

  async deleteCourse(courseId, requesterId) {
    const course = await this.getCourseById(courseId);
    
    if (!course) {
      throw new Error('Course not found');
    }


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


    await course.update({ isActive: false });
    return true;
  }



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

export default new CourseService();