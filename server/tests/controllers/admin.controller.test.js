import { jest, describe, beforeEach, test, expect } from '@jest/globals';

// Mock the dependencies using unstable_mockModule for ES modules
const mockAdminService = {
  createCourse: jest.fn(),
  updateCourse: jest.fn(),
  deleteCourse: jest.fn(),
  getEnrollmentsByCourse: jest.fn(),
  getCourseEnrollmentCount: jest.fn(),
  getCourseStats: jest.fn(),
  getCourseEnrolledUsers: jest.fn()
};

const mockValidationResult = jest.fn();

// Mock modules before importing
jest.unstable_mockModule('../../src/services/admin.service.js', () => ({
  default: mockAdminService
}));

jest.unstable_mockModule('express-validator', () => ({
  validationResult: mockValidationResult
}));

// Import after mocks are set up
const { default: AdminController } = await import('../../src/controllers/admin.controller.js');

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
      const mockCourse = { id: 1, ...mockCourseData };
      
      mockValidationResult.mockReturnValue({ isEmpty: () => true });
      mockAdminService.createCourse.mockResolvedValue(mockCourse);

      await AdminController.createCourse(req, res);

      expect(mockAdminService.createCourse).toHaveBeenCalledWith(mockCourseData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Course created successfully',
        data: mockCourse
      });
    });

    it('should return validation errors when validation fails', async () => {
      const mockErrors = [{ field: 'title', message: 'Title is required' }];
      
      mockValidationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => mockErrors
      });

      await AdminController.createCourse(req, res);

      expect(mockAdminService.createCourse).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Validation failed',
        errors: mockErrors
      });
    });

    it('should handle service errors', async () => {
      const errorMessage = 'Database connection failed';
      
      mockValidationResult.mockReturnValue({ isEmpty: () => true });
      mockAdminService.createCourse.mockRejectedValue(new Error(errorMessage));

      await AdminController.createCourse(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: errorMessage
      });
    });

    it('should handle unknown errors', async () => {
      mockValidationResult.mockReturnValue({ isEmpty: () => true });
      mockAdminService.createCourse.mockRejectedValue(new Error());

      await AdminController.createCourse(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to create course'
      });
    });

    it('should set default isActive to true when not provided', async () => {
      const courseDataWithoutIsActive = {
        title: 'Test Course',
        description: 'Test Description',
        price: 99.99,
        durationHours: 10,
        courseContent: []
      };
      req.body = courseDataWithoutIsActive;
      
      const expectedCourseData = { ...courseDataWithoutIsActive, isActive: true };
      
      mockValidationResult.mockReturnValue({ isEmpty: () => true });
      mockAdminService.createCourse.mockResolvedValue({ id: 1, ...expectedCourseData });

      await AdminController.createCourse(req, res);

      expect(mockAdminService.createCourse).toHaveBeenCalledWith(expectedCourseData);
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
      const mockUpdatedCourse = { id: 1, ...mockUpdateData };
      const expectedUpdateData = { ...mockUpdateData, courseContent: [] };
      
      mockValidationResult.mockReturnValue({ isEmpty: () => true });
      mockAdminService.updateCourse.mockResolvedValue(mockUpdatedCourse);

      await AdminController.updateCourse(req, res);

      expect(mockAdminService.updateCourse).toHaveBeenCalledWith('1', expectedUpdateData);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Course updated successfully',
        data: mockUpdatedCourse
      });
    });

    it('should return validation errors when validation fails', async () => {
      const mockErrors = [{ field: 'price', message: 'Price must be a number' }];
      
      mockValidationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => mockErrors
      });

      await AdminController.updateCourse(req, res);

      expect(mockAdminService.updateCourse).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Validation failed',
        errors: mockErrors
      });
    });

    it('should handle course not found error', async () => {
      mockValidationResult.mockReturnValue({ isEmpty: () => true });
      mockAdminService.updateCourse.mockRejectedValue(new Error('Course not found'));

      await AdminController.updateCourse(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Course not found'
      });
    });

    it('should handle other service errors', async () => {
      const errorMessage = 'Database update failed';
      
      mockValidationResult.mockReturnValue({ isEmpty: () => true });
      mockAdminService.updateCourse.mockRejectedValue(new Error(errorMessage));

      await AdminController.updateCourse(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: errorMessage
      });
    });
  });

  describe('deleteCourse', () => {
    beforeEach(() => {
      req.params.id = '1';
    });

    it('should delete a course successfully', async () => {
      const mockResult = {
        success: true,
        message: 'Course deleted successfully',
        course: { id: 1, title: 'Deleted Course' }
      };
      
      mockAdminService.deleteCourse.mockResolvedValue(mockResult);

      await AdminController.deleteCourse(req, res);

      expect(mockAdminService.deleteCourse).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Course deleted successfully',
        data: { id: 1, title: 'Deleted Course' }
      });
    });

    it('should handle course not found error', async () => {
      mockAdminService.deleteCourse.mockRejectedValue(new Error('Course not found'));

      await AdminController.deleteCourse(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Course not found'
      });
    });

    it('should handle other service errors', async () => {
      const errorMessage = 'Database deletion failed';
      
      mockAdminService.deleteCourse.mockRejectedValue(new Error(errorMessage));

      await AdminController.deleteCourse(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: errorMessage
      });
    });

    it('should handle result without course data', async () => {
      const mockResult = {
        success: true,
        message: 'Course deleted successfully'
      };
      
      mockAdminService.deleteCourse.mockResolvedValue(mockResult);

      await AdminController.deleteCourse(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Course deleted successfully',
        data: null
      });
    });
  });
});