import CourseService from '../services/course.service.js';
import studentService from '../services/student.service.js';
import db from '../models/index.js';

const { CourseContent } = db;

export const getAllCourses = async (req, res) => {
  try {
    const courses = await CourseService.getAllActiveCourses();
    res.status(200).json(courses);
  } catch (err) {
    console.error("Error fetching courses:", err);
    res.status(500).json({ message: "Failed to fetch courses" });
  }
};

export const getCourseById = async (req, res) => {
   const { id } = req.params;

  try {
    const course = await CourseService.getCourseById(id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.status(200).json(course);
  } catch (err) {
    console.error("Error fetching course:", err);
    res.status(500).json({ message: "Failed to fetch course" });
  }
};

export const enrollInCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.user?.id; // From auth middleware

    if (!studentId) {
      return res.status(401).json({
        message: 'Authentication required',
        success: false
      });
    }

    if (!id) {
      return res.status(400).json({
        message: 'Course ID is required',
        success: false
      });
    }

    const enrollment = await studentService.enrollInCourse(studentId, id);

    res.status(201).json({
      message: 'Successfully enrolled in course',
      success: true,
      data: enrollment
    });
  } catch (error) {
    console.error('Error enrolling in course:', error);
    
    // Handle specific business logic errors
    if (error.message === 'Course not found or not available' ||
        error.message === 'Already enrolled in this course' ||
        error.message === 'Only students can enroll in courses') {
      return res.status(400).json({
        message: error.message,
        success: false
      });
    }

    if (error.message === 'Student not found') {
      return res.status(404).json({
        message: error.message,
        success: false
      });
    }

    res.status(500).json({
      message: 'Internal server error',
      success: false,
      error: error.message
    });
  }
};

export const getStudentEnrollments = async (req, res) => {
  try {
    const studentId = req.user?.id; // From auth middleware

    if (!studentId) {
      return res.status(401).json({
        message: 'Authentication required',
        success: false
      });
    }

    const enrollments = await studentService.getStudentEnrollments(studentId);

    res.status(200).json({
      message: 'Enrollments retrieved successfully',
      success: true,
      data: enrollments,
      total: enrollments.length
    });
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    res.status(500).json({
      message: 'Internal server error',
      success: false,
      error: error.message
    });
  }
};