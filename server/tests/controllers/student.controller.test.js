import { jest } from '@jest/globals';

// Mock the dependencies using ES module mocking
jest.unstable_mockModule('../../src/services/course.service.js', () => ({
  default: {
    getAllActiveCourses: jest.fn(),
    getCourseById: jest.fn()
  }
}));

jest.unstable_mockModule('../../src/services/student.service.js', () => ({
  default: {}
}));

jest.unstable_mockModule('../../src/models/index.js', () => ({
  default: {}
}));

// Import after mocking
const { getAllCourses, getCourseById } = await import('../../src/controllers/student.controller.js');
const CourseService = (await import('../../src/services/course.service.js')).default;

describe('Student Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {},
      body: {},
      user: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    jest.clearAllMocks();
  });

  describe('getAllCourses', () => {
    it('should return all active courses successfully', async () => {
      // Arrange
      const mockCourses = [
        {
          id: 1,
          title: 'JavaScript Fundamentals',
          description: 'Learn JavaScript basics',
          price: 99.99,
          status: 'active'
        },
        {
          id: 2,
          title: 'React Development',
          description: 'Build React applications',
          price: 149.99,
          status: 'active'
        }
      ];
      CourseService.getAllActiveCourses.mockResolvedValue(mockCourses);

      // Act
      await getAllCourses(req, res);

      // Assert
      expect(CourseService.getAllActiveCourses).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockCourses);
    });

    it('should handle errors when fetching courses fails', async () => {
      // Arrange
      const errorMessage = 'Database connection failed';
      CourseService.getAllActiveCourses.mockRejectedValue(new Error(errorMessage));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      await getAllCourses(req, res);

      // Assert
      expect(CourseService.getAllActiveCourses).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching courses:', expect.any(Error));
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Failed to fetch courses' });
      
      consoleSpy.mockRestore();
    });

    it('should return empty array when no courses exist', async () => {
      // Arrange
      CourseService.getAllActiveCourses.mockResolvedValue([]);

      // Act
      await getAllCourses(req, res);

      // Assert
      expect(CourseService.getAllActiveCourses).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });
  });

  describe('getCourseById', () => {
    it('should return course when valid ID is provided', async () => {
      // Arrange
      const courseId = '1';
      const mockCourse = {
        id: 1,
        title: 'JavaScript Fundamentals',
        description: 'Learn JavaScript basics',
        price: 99.99,
        status: 'active',
        instructor: 'John Doe'
      };
      req.params.id = courseId;
      CourseService.getCourseById.mockResolvedValue(mockCourse);

      // Act
      await getCourseById(req, res);

      // Assert
      expect(CourseService.getCourseById).toHaveBeenCalledWith(courseId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockCourse);
    });

    it('should return 404 when course is not found', async () => {
      // Arrange
      const courseId = '999';
      req.params.id = courseId;
      CourseService.getCourseById.mockResolvedValue(null);

      // Act
      await getCourseById(req, res);

      // Assert
      expect(CourseService.getCourseById).toHaveBeenCalledWith(courseId);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Course not found' });
    });

    it('should handle errors when fetching course fails', async () => {
      // Arrange
      const courseId = '1';
      const errorMessage = 'Database query failed';
      req.params.id = courseId;
      CourseService.getCourseById.mockRejectedValue(new Error(errorMessage));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      await getCourseById(req, res);

      // Assert
      expect(CourseService.getCourseById).toHaveBeenCalledWith(courseId);
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching course:', expect.any(Error));
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Failed to fetch course' });
      
      consoleSpy.mockRestore();
    });

    it('should handle invalid course ID format', async () => {
      // Arrange
      const invalidCourseId = 'invalid-id';
      req.params.id = invalidCourseId;
      CourseService.getCourseById.mockRejectedValue(new Error('Invalid ID format'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      await getCourseById(req, res);

      // Assert
      expect(CourseService.getCourseById).toHaveBeenCalledWith(invalidCourseId);
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching course:', expect.any(Error));
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Failed to fetch course' });
      
      consoleSpy.mockRestore();
    });

    it('should handle undefined course ID', async () => {
      // Arrange
      req.params = {}; // No id parameter
      CourseService.getCourseById.mockResolvedValue(null);

      // Act
      await getCourseById(req, res);

      // Assert
      expect(CourseService.getCourseById).toHaveBeenCalledWith(undefined);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Course not found' });
    });
  });
});