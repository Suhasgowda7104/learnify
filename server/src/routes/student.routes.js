import express from 'express';
import { getAllCourses, getCourseById, enrollInCourse, getStudentEnrollments } from '../controllers/student.controller.js';
import { authenticateToken, requireStudent } from '../middleware/auth.middleware.js';

const router = express.Router();
router.post('/courses/:id/enroll', authenticateToken, requireStudent, enrollInCourse);
router.get('/courses', getAllCourses); 
router.get('/courses/:id', getCourseById);
router.get('/enrollments', authenticateToken, requireStudent, getStudentEnrollments);

export default router;