import express from 'express';
import { enrollInCourse, getStudentEnrollments } from '../controllers/enrollment.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware.authenticateToken);
router.use(authMiddleware.requireStudent);

/**
 * @swagger
 * /enrollments/courses/{id}/enroll:
 *   post:
 *     summary: Enroll in a course
 *     tags: [Student - Enrollment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID (UUID)
 *     responses:
 *       201:
 *         description: Successfully enrolled in course
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Successfully enrolled in course"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "enrollment-uuid-123"
 *                     courseId:
 *                       type: string
 *                       example: "course-uuid-456"
 *                     courseTitle:
 *                       type: string
 *                       example: "Introduction to JavaScript"
 *                     enrollmentDate:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T10:30:00Z"
 *                     status:
 *                       type: string
 *                       example: "enrolled"
 *       400:
 *         description: Bad request - validation error or already enrolled
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Already enrolled in this course"
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Authentication required"
 *       404:
 *         description: Student not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Student not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 *                 error:
 *                   type: string
 *                   example: "Database connection failed"
 */
router.post('/courses/:id/enroll', enrollInCourse);

/**
 * @swagger
 * /enrollments/enrollments:
 *   get:
 *     summary: Get student enrollments
 *     tags: [Student - Enrollment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Enrollments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Enrollments retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "enrollment-uuid-123"
 *                       enrollmentDate:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-01-15T10:30:00Z"
 *                       status:
 *                         type: string
 *                         example: "enrolled"
 *                       completionDate:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                         example: null
 *                       course:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "course-uuid-456"
 *                           title:
 *                             type: string
 *                             example: "Introduction to JavaScript"
 *                           description:
 *                             type: string
 *                             example: "Learn the fundamentals of JavaScript programming"
 *                           price:
 *                             type: number
 *                             example: 99.99
 *                           durationHours:
 *                             type: integer
 *                             example: 40
 *                 total:
 *                   type: integer
 *                   example: 3
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Authentication required"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 *                 error:
 *                   type: string
 *                   example: "Database connection failed"
 */
router.get('/enrollments', getStudentEnrollments);

export default router;