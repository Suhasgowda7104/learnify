import { jest } from '@jest/globals';

// Mock the dependencies using ES module mocking
jest.unstable_mockModule('../../src/models/index.js', () => ({
  default: {
    Course: {},
    User: {},
    Enrollment: {},
    CourseContent: {},
    sequelize: {
      transaction: jest.fn()
    }
  }
}));

jest.unstable_mockModule('../../src/services/admin.service.js', () => ({
  default: {
    createCourse: jest.fn(),
    updateCourse: jest.fn(),
    deleteCourse: jest.fn(),
  }
}));

jest.unstable_mockModule('express-validator', () => ({
  validationResult: jest.fn()
}));

// Import after mocking
const AdminController = (await import('../../src/controllers/admin.controller.js')).default;
const AdminService = (await import('../../src/services/admin.service.js')).default;
const { validationResult } = await import('express-validator');

describe('AdminController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('createCourse', () => {
    const mockCourseData = {
      title: 'Test Course',
      description: 'Test Description',
      price: 99.99,
      durationHours: 10,
      isActive: true,
      courseContent: []
    };

    beforeEach(() => {
      req.body = mockCourseData;
    });

    it('should create a course successfully', async () => {
      // Arrange
      const mockCourse = { id: 1, ...mockCourseData };
      validationResult.mockReturnValue({ isEmpty: () => true });
      AdminService.createCourse.mockResolvedValue(mockCourse);

      // Act
      await AdminController.createCourse(req, res);

      // Assert
      expect(AdminService.createCourse).toHaveBeenCalledWith(mockCourseData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Course created successfully',
        data: mockCourse
      });
    });

    it('should return validation errors when validation fails', async () => {
      // Arrange
      const mockErrors = [{ field: 'title', message: 'Title is required' }];
      validationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => mockErrors
      });

      // Act
      await AdminController.createCourse(req, res);

      // Assert
      expect(AdminService.createCourse).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Validation failed',
        errors: mockErrors
      });
    });

    it('should handle service errors', async () => {
      // Arrange
      const errorMessage = 'Database connection failed';
      validationResult.mockReturnValue({ isEmpty: () => true });
      AdminService.createCourse.mockRejectedValue(new Error(errorMessage));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      await AdminController.createCourse(req, res);

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('Create course error:', expect.any(Error));
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: errorMessage
      });
      
      consoleSpy.mockRestore();
    });

    it('should handle unknown errors', async () => {
      // Arrange
      validationResult.mockReturnValue({ isEmpty: () => true });
      AdminService.createCourse.mockRejectedValue(new Error());
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      await AdminController.createCourse(req, res);

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('Create course error:', expect.any(Error));
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to create course'
      });
      
      consoleSpy.mockRestore();
    });

    it('should set default isActive to true when not provided', async () => {
      // Arrange
      const courseDataWithoutIsActive = {
        title: 'Test Course',
        description: 'Test Description',
        price: 99.99,
        durationHours: 10,
        courseContent: []
      };
      req.body = courseDataWithoutIsActive;
      const expectedCourseData = { ...courseDataWithoutIsActive, isActive: true };
      validationResult.mockReturnValue({ isEmpty: () => true });
      AdminService.createCourse.mockResolvedValue({ id: 1, ...expectedCourseData });

      // Act
      await AdminController.createCourse(req, res);

      // Assert
      expect(AdminService.createCourse).toHaveBeenCalledWith(expectedCourseData);
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('updateCourse', () => {
    const mockUpdateData = {
      title: 'Updated Course',
      description: 'Updated Description',
      price: 149.99,
      durationHours: 15,
      isActive: false
    };

    beforeEach(() => {
      req.params.id = '1';
      req.body = mockUpdateData;
    });

    it('should update a course successfully', async () => {
      // Arrange
      const mockUpdatedCourse = { id: 1, ...mockUpdateData };
      const expectedUpdateData = { ...mockUpdateData, courseContent: [] };
      validationResult.mockReturnValue({ isEmpty: () => true });
      AdminService.updateCourse.mockResolvedValue(mockUpdatedCourse);

      // Act
      await AdminController.updateCourse(req, res);

      // Assert
      expect(AdminService.updateCourse).toHaveBeenCalledWith('1', expectedUpdateData);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Course updated successfully',
        data: mockUpdatedCourse
      });
    });

    it('should return validation errors when validation fails', async () => {
      // Arrange
      const mockErrors = [{ field: 'price', message: 'Price must be a number' }];
      validationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => mockErrors
      });

      // Act
      await AdminController.updateCourse(req, res);

      // Assert
      expect(AdminService.updateCourse).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Validation failed',
        errors: mockErrors
      });
    });

    it('should handle course not found error', async () => {
      // Arrange
      validationResult.mockReturnValue({ isEmpty: () => true });
      AdminService.updateCourse.mockRejectedValue(new Error('Course not found'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      await AdminController.updateCourse(req, res);

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('Update course error:', expect.any(Error));
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Course not found'
      });
      
      consoleSpy.mockRestore();
    });

    it('should handle other service errors', async () => {
      // Arrange
      const errorMessage = 'Database update failed';
      validationResult.mockReturnValue({ isEmpty: () => true });
      AdminService.updateCourse.mockRejectedValue(new Error(errorMessage));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      await AdminController.updateCourse(req, res);

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('Update course error:', expect.any(Error));
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: errorMessage
      });
      
      consoleSpy.mockRestore();
    });
  });

  describe('deleteCourse', () => {
    beforeEach(() => {
      req.params.id = '1';
    });

    it('should delete a course successfully', async () => {
      // Arrange
      const mockResult = {
        success: true,
        message: 'Course deleted successfully',
        course: { id: 1, title: 'Deleted Course' }
      };
      AdminService.deleteCourse.mockResolvedValue(mockResult);

      // Act
      await AdminController.deleteCourse(req, res);

      // Assert
      expect(AdminService.deleteCourse).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Course deleted successfully',
        data: { id: 1, title: 'Deleted Course' }
      });
    });

    it('should handle course not found error', async () => {
      // Arrange
      AdminService.deleteCourse.mockRejectedValue(new Error('Course not found'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      await AdminController.deleteCourse(req, res);

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('Delete course error:', expect.any(Error));
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Course not found'
      });
      
      consoleSpy.mockRestore();
    });

    it('should handle other service errors', async () => {
      // Arrange
      const errorMessage = 'Database deletion failed';
      AdminService.deleteCourse.mockRejectedValue(new Error(errorMessage));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      await AdminController.deleteCourse(req, res);

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('Delete course error:', expect.any(Error));
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: errorMessage
      });
      
      consoleSpy.mockRestore();
    });

    it('should handle result without course data', async () => {
      // Arrange
      const mockResult = {
        success: true,
        message: 'Course deleted successfully'
      };
      AdminService.deleteCourse.mockResolvedValue(mockResult);

      // Act
      await AdminController.deleteCourse(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Course deleted successfully',
        data: null
      });
    });
  });
});