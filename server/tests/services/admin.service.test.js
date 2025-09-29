import sinon from 'sinon';

let sandbox = null;

beforeEach(() => {
  sandbox = sinon.createSandbox();
});

afterEach(() => {
  sandbox.restore();
});

const AdminService = (await import('../../src/services/admin.service.js')).default;
const db = (await import('../../src/models/index.js')).default;

describe('AdminService', () => {
  let mockTransaction;

  beforeEach(() => {
    mockTransaction = {
      commit: sinon.stub(),
      rollback: sinon.stub()
    };
    sandbox.stub(db.sequelize, 'transaction').resolves(mockTransaction);
  });

  describe('createCourse', () => {
    it('should create a course successfully', async () => {
      // Arrange
      const courseData = {
        title: 'Test Course',
        description: 'Test Description',
        category: 'Programming',
        level: 'Beginner',
        price: 99.99,
        durationHours: 10,
        thumbnail: 'test.jpg',
        courseContent: [
          { title: 'Lesson 1', contentType: 'video', filePath: 'lesson1.mp4' },
          { title: 'Lesson 2', contentType: 'text', filePath: null }
        ]
      };

      const mockCourse = { id: 1, title: courseData.title, description: courseData.description };
      const mockCourseWithContent = { ...mockCourse, contents: [] };
      
      sandbox.stub(db.Course, 'create').resolves(mockCourse);
      sandbox.stub(db.CourseContent, 'bulkCreate').resolves([]);
      sandbox.stub(db.Course, 'findByPk').resolves(mockCourseWithContent);

      // Act
      const result = await AdminService.createCourse(courseData);

      // Assert
      expect(result).toEqual(mockCourseWithContent);
      expect(db.Course.create.calledOnce).toBe(true);
      expect(db.CourseContent.bulkCreate.calledOnce).toBe(true);
      expect(db.Course.findByPk.calledWith(1)).toBe(true);
      expect(mockTransaction.commit.calledOnce).toBe(true);
    });

    it('should handle database errors and rollback transaction', async () => {
      // Arrange
      const courseData = {
        title: 'Test Course',
        description: 'Test Description',
        price: 99.99,
        instructor_id: 1
      };

      const error = new Error('Database error');
      sandbox.stub(db.Course, 'create').rejects(error);

      // Act & Assert
      await expect(AdminService.createCourse(courseData)).rejects.toThrow('Database error');
      expect(mockTransaction.rollback.calledOnce).toBe(true);
    });
  });

  describe('updateCourse', () => {
    it('should update a course successfully', async () => {
      // Arrange
      const courseId = 1;
      const updateData = {
        title: 'Updated Course',
        description: 'Updated Description',
        price: 149.99,
        content: [
          { title: 'Updated Lesson 1', content: 'Updated Content 1', order: 1 }
        ]
      };

      const mockCourse = {
        id: courseId,
        update: sinon.stub().resolves(),
        reload: sinon.stub().resolves()
      };

      sandbox.stub(db.Course, 'findByPk').resolves(mockCourse);
      sandbox.stub(db.CourseContent, 'destroy').resolves();
      sandbox.stub(db.CourseContent, 'bulkCreate').resolves([]);

      // Act
      const result = await AdminService.updateCourse(courseId, updateData);

      // Assert
      expect(result).toEqual(mockCourse);
      expect(db.Course.findByPk.calledWith(courseId)).toBe(true);
      expect(mockCourse.update.calledOnce).toBe(true);
      expect(mockTransaction.commit.calledOnce).toBe(true);
    });

    it('should throw error if course not found', async () => {
      // Arrange
      const courseId = 999;
      const updateData = { title: 'Updated Course' };

      sandbox.stub(db.Course, 'findByPk').resolves(null);

      // Act & Assert
      await expect(AdminService.updateCourse(courseId, updateData)).rejects.toThrow('Course not found');
      expect(mockTransaction.rollback.calledOnce).toBe(true);
    });
  });

  describe('deleteCourse', () => {
    it('should hard delete course when no enrollments exist', async () => {
      // Arrange
      const courseId = 1;
      const mockCourse = {
        id: courseId,
        destroy: sinon.stub().resolves()
      };

      sandbox.stub(db.Course, 'findByPk').resolves(mockCourse);
      sandbox.stub(db.Enrollment, 'count').resolves(0);

      // Act
      const result = await AdminService.deleteCourse(courseId);

      // Assert
      expect(result.message).toBe('Course deleted successfully');
      expect(db.Course.findByPk.calledWith(courseId)).toBe(true);
      expect(mockCourse.destroy.calledOnce).toBe(true);
    });

    it('should soft delete course when enrollments exist', async () => {
      // Arrange
      const courseId = 1;
      const mockCourse = {
        id: courseId,
        update: sinon.stub().resolves()
      };

      sandbox.stub(db.Course, 'findByPk').resolves(mockCourse);
      sandbox.stub(db.Enrollment, 'count').resolves(5);

      // Act
      const result = await AdminService.deleteCourse(courseId);

      // Assert
      expect(result.message).toBe('Course deactivated due to existing enrollments');
      expect(result.course).toEqual(mockCourse);
      expect(mockCourse.update.calledWith({ is_active: false })).toBe(true);
    });

    it('should throw error if course not found', async () => {
      // Arrange
      const courseId = 999;
      sandbox.stub(db.Course, 'findByPk').resolves(null);

      // Act & Assert
      await expect(AdminService.deleteCourse(courseId)).rejects.toThrow('Course not found');
    });
  });

  describe('getEnrollmentsByCourse', () => {
    it('should return enrollments for a course', async () => {
      const courseId = 1;
      const mockCourse = { id: 1, title: 'Test Course', description: 'Test Description' };
      const mockEnrollments = [
        {
          id: 1,
          enrolled_at: new Date(),
          progress: 50,
          completed_at: null,
          User: {
            id: 1,
            first_name: 'John',
            last_name: 'Doe',
            email: 'john@example.com',
            created_at: new Date(),
            Role: { name: 'student' }
          }
        }
      ];

      sandbox.stub(db.Course, 'findByPk').resolves(mockCourse);
      sandbox.stub(db.Enrollment, 'findAll').resolves(mockEnrollments);

      const result = await AdminService.getEnrollmentsByCourse(courseId);

      expect(result.course).toEqual({
        id: mockCourse.id,
        title: mockCourse.title,
        description: mockCourse.description
      });
      expect(result.enrollments).toHaveLength(1);
      expect(result.total_enrollments).toBe(1);
      expect(result.enrollments[0].student.first_name).toBe('John');
    });

    it('should throw error if course not found', async () => {
      const courseId = 999;
      sandbox.stub(db.Course, 'findByPk').resolves(null);

      await expect(AdminService.getEnrollmentsByCourse(courseId))
        .rejects.toThrow('Course not found');
    });

    it('should handle database errors', async () => {
      const courseId = 1;
      sandbox.stub(db.Course, 'findByPk').rejects(new Error('Database error'));

      await expect(AdminService.getEnrollmentsByCourse(courseId))
        .rejects.toThrow('Failed to fetch enrollments: Database error');
    });
  });

  describe('getCourseStats', () => {
    it('should return course statistics', async () => {
      const mockStats = {
        total_courses: 10,
        active_courses: 8,
        total_enrollments: 50,
        total_students: 25
      };

      // Mock Course.count calls
      const courseCountStub = sandbox.stub(db.Course, 'count');
      courseCountStub.onFirstCall().resolves(10); // total courses
      courseCountStub.onSecondCall().resolves(8); // active courses

      // Mock Enrollment.count
      sandbox.stub(db.Enrollment, 'count').resolves(50);
      
      // Mock User.count with include for Role
      sandbox.stub(db.User, 'count').resolves(25);

      const result = await AdminService.getCourseStats();

      expect(result).toEqual(mockStats);
      expect(db.Course.count.calledTwice).toBe(true);
      expect(db.Enrollment.count.calledOnce).toBe(true);
      expect(db.User.count.calledOnce).toBe(true);
    });

    it('should handle database errors', async () => {
      sandbox.stub(db.Course, 'count').rejects(new Error('Database error'));

      await expect(AdminService.getCourseStats())
        .rejects.toThrow('Failed to fetch course statistics: Database error');
    });
  });

  describe('getCourseEnrolledUsers', () => {
    it('should return enrolled users for a course', async () => {
      // Arrange
      const courseId = 1;
      const mockEnrollments = [
        {
          id: 1,
          enrollmentDate: '2024-01-01',
          status: 'enrolled',
          student: {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com'
          }
        },
        {
          id: 2,
          enrollmentDate: '2024-01-02',
          status: 'enrolled',
          student: {
            id: 2,
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane@example.com'
          }
        }
      ];

      sandbox.stub(db.Enrollment, 'findAll').resolves(mockEnrollments);

      // Act
      const result = await AdminService.getCourseEnrolledUsers(courseId);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        userId: 1,
        userName: 'John Doe',
        email: 'john@example.com',
        enrollmentDate: '2024-01-01'
      });
      expect(result[1]).toEqual({
        userId: 2,
        userName: 'Jane Smith',
        email: 'jane@example.com',
        enrollmentDate: '2024-01-02'
      });
      expect(db.Enrollment.findAll.calledOnce).toBe(true);
    });

    it('should handle database errors', async () => {
      // Arrange
      const courseId = 1;
      const error = new Error('Database error');
      sandbox.stub(db.Enrollment, 'findAll').rejects(error);

      // Act & Assert
      await expect(AdminService.getCourseEnrolledUsers(courseId)).rejects.toThrow('Database error');
    });
  });
});