import bcryptjs from 'bcryptjs';
import { generateToken } from '../../config/jwt.config.js';
import db from '../models/index.js';

const { User, Role } = db;

/**
 * Auth Service - Contains all authentication-related business logic
 */
class AuthService {
  /**
   * Register a new student user
   * @param {Object} userData - User registration data
   * @param {string} userData.firstName - User's first name
   * @param {string} userData.lastName - User's last name
   * @param {string} userData.email - User's email
   * @param {string} userData.password - User's password
   * @returns {Object} Created user data without password
   */
  async registerStudent(userData) {
    const { firstName, lastName, email, password } = userData;

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      throw new Error('All fields are required');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Find student role
    const studentRole = await Role.findOne({ where: { name: 'student' } });
    if (!studentRole) {
      throw new Error('Student role not found in system');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(password);

    // Create new user
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      roleId: studentRole.id,
      isActive: true
    });

    // Return user data without password
    return this.sanitizeUserData(newUser);
  }

  /**
   * Authenticate user and generate JWT token
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - User's email
   * @param {string} credentials.password - User's password
   * @returns {Object} User data and JWT token
   */
  async authenticateUser(credentials) {
    const { email, password } = credentials;

    // Validate required fields
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Find user with role information
    const user = await User.findOne({
      where: { email },
      include: [{
        model: Role,
        as: 'role',
        attributes: ['name']
      }]
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('Account is not active');
    }

    // Verify password
    const isPasswordValid = await this.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role.name
    });

    // Return user data and token
    return {
      user: this.sanitizeUserDataWithRole(user),
      token
    };
  }

  /**
   * Find user by email
   * @param {string} email - User's email
   * @returns {Object|null} User data with role or null if not found
   */
  async findUserByEmail(email) {
    return await User.findOne({
      where: { email },
      include: [{
        model: Role,
        as: 'role',
        attributes: ['name']
      }]
    });
  }

  /**
   * Find user by ID
   * @param {string} userId - User's ID
   * @returns {Object|null} User data with role or null if not found
   */
  async findUserById(userId) {
    return await User.findByPk(userId, {
      include: [{
        model: Role,
        as: 'role',
        attributes: ['name']
      }]
    });
  }

  /**
   * Hash password using bcrypt
   * @param {string} password - Plain text password
   * @returns {string} Hashed password
   */
  async hashPassword(password) {
    const saltRounds = 10;
    return await bcryptjs.hash(password, saltRounds);
  }

  /**
   * Verify password against hash
   * @param {string} password - Plain text password
   * @param {string} hashedPassword - Hashed password
   * @returns {boolean} True if password matches
   */
  async verifyPassword(password, hashedPassword) {
    return await bcryptjs.compare(password, hashedPassword);
  }

  /**
   * Update user password
   * @param {string} userId - User's ID
   * @param {string} newPassword - New plain text password
   * @returns {boolean} True if password updated successfully
   */
  async updatePassword(userId, newPassword) {
    const hashedPassword = await this.hashPassword(newPassword);
    const [updatedRows] = await User.update(
      { password: hashedPassword },
      { where: { id: userId } }
    );
    return updatedRows > 0;
  }

  /**
   * Activate/deactivate user account
   * @param {string} userId - User's ID
   * @param {boolean} isActive - Active status
   * @returns {boolean} True if status updated successfully
   */
  async updateUserStatus(userId, isActive) {
    const [updatedRows] = await User.update(
      { isActive },
      { where: { id: userId } }
    );
    return updatedRows > 0;
  }

  /**
   * Remove sensitive data from user object
   * @param {Object} user - User object
   * @returns {Object} Sanitized user data
   */
  sanitizeUserData(user) {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      isActive: user.isActive,
      roleId: user.roleId
    };
  }

  /**
   * Remove sensitive data from user object including role
   * @param {Object} user - User object with role
   * @returns {Object} Sanitized user data with role
   */
  sanitizeUserDataWithRole(user) {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      isActive: user.isActive,
      role: user.role.name
    };
  }
}

// Export singleton instance
export default new AuthService();