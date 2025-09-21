import db from '../models/index.js';

const { Course, User, Enrollment, sequelize } = db;

class EnrollmentService { 
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

  async getStudentEnrollments(studentId) {
    console.log('🔍 Getting enrollments for student ID:', studentId);
    
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

    console.log('📊 Found enrollments:', enrollments.length);
    enrollments.forEach((enrollment, index) => {
      console.log(`📝 Enrollment ${index + 1}:`, {
        id: enrollment.id,
        studentId: enrollment.studentId,
        courseId: enrollment.courseId,
        courseTitle: enrollment.course?.title
      });
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
export default new EnrollmentService();