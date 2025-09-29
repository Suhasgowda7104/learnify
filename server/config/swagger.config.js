import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Learnify API',
      version: '1.0.0',
      description: 'A comprehensive Learning Management System API',
      contact: {
        name: 'Learnify Team',
        email: 'support@learnify.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000/api/v1',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'User ID'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            firstName: {
              type: 'string',
              description: 'User first name'
            },
            lastName: {
              type: 'string',
              description: 'User last name'
            },
            role: {
              type: 'string',
              enum: ['student', 'instructor', 'admin'],
              description: 'User role'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation timestamp'
            }
          }
        },
        Course: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Course ID'
            },
            title: {
              type: 'string',
              description: 'Course title'
            },
            description: {
              type: 'string',
              description: 'Course description'
            },
            instructorId: {
              type: 'integer',
              description: 'Instructor user ID'
            },
            price: {
              type: 'number',
              format: 'decimal',
              description: 'Course price'
            },
            duration: {
              type: 'integer',
              description: 'Course duration in hours'
            },
            level: {
              type: 'string',
              enum: ['beginner', 'intermediate', 'advanced'],
              description: 'Course difficulty level'
            },
            isPublished: {
              type: 'boolean',
              description: 'Course publication status'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Course creation timestamp'
            }
          }
        },
        Enrollment: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Enrollment ID'
            },
            studentId: {
              type: 'integer',
              description: 'Student user ID'
            },
            courseId: {
              type: 'integer',
              description: 'Course ID'
            },
            enrollmentDate: {
              type: 'string',
              format: 'date-time',
              description: 'Enrollment timestamp'
            },
            progress: {
              type: 'number',
              minimum: 0,
              maximum: 100,
              description: 'Course completion progress percentage'
            },
            status: {
              type: 'string',
              enum: ['active', 'completed', 'dropped'],
              description: 'Enrollment status'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Error message'
            },
            status: {
              type: 'integer',
              description: 'HTTP status code'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Error timestamp'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Success message'
            },
            data: {
              type: 'object',
              description: 'Response data'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    path.join(__dirname, '../src/routes/*.js'),
    path.join(__dirname, '../index.js')
  ]
};

const specs = swaggerJsdoc(options);

export { specs, swaggerUi };