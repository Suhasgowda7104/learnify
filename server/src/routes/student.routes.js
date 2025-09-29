import express from 'express';
import authMiddleware from '../middleware/auth.middleware.js'
import { getAllCourses, getCourseById } from '../controllers/student.controller.js';

const router = express.Router();

router.use(authMiddleware.authenticateToken);
router.use(authMiddleware.requireStudent);

/**
 * @swagger
 * /student/courses:
 *   get:
 *     summary: Get available courses
 *     tags: [Student - Courses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved available courses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                     example: "a236048-b163-4d42-947b-647b6cf9d208"
 *                   title:
 *                     type: string
 *                     example: "Introduction to JavaScript"
 *                   description:
 *                     type: string
 *                     example: "Learn the fundamentals of JavaScript programming"
 *                   price:
 *                     type: number
 *                     format: decimal
 *                     example: 99.99
 *                   durationHours:
 *                     type: integer
 *                     example: 40
 *                   isActive:
 *                     type: boolean
 *                     example: true
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-01-15T10:30:00.000Z"
 *                   updated_at:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-01-15T10:30:00.000Z"
 *                   enrollmentCount:
 *                     type: string
 *                     example: "15"
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Access token is required"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */
router.get('/courses', getAllCourses);

/**
 * @swagger
 * /student/courses/{id}:
 *   get:
 *     summary: Get course details
 *     tags: [Student - Courses]
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
 *       200:
 *         description: Successfully retrieved course details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                   example: "a236048-b163-4d42-947b-647b6cf9d208"
 *                 title:
 *                   type: string
 *                   example: "Introduction to JavaScript"
 *                 description:
 *                   type: string
 *                   example: "Learn the fundamentals of JavaScript programming"
 *                 price:
 *                   type: number
 *                   format: decimal
 *                   example: 99.99
 *                 durationHours:
 *                   type: integer
 *                   example: 40
 *                 isActive:
 *                   type: boolean
 *                   example: true
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-15T10:30:00.000Z"
 *                 updated_at:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-15T10:30:00.000Z"
 *                 contents:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                         example: "b347159-c274-5e53-a58c-758c7dfa0e19"
 *                       title:
 *                         type: string
 *                         example: "Variables and Data Types"
 *                       contentType:
 *                         type: string
 *                         example: "video"
 *                       filePath:
 *                         type: string
 *                         example: "/uploads/courses/lesson1.mp4"
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-01-15T10:30:00.000Z"
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-01-15T10:30:00.000Z"
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Access token is required"
 *       404:
 *         description: Course not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Course not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */
router.get('/courses/:id', getCourseById);

export default router;