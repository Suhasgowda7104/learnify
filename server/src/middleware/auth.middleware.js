import jwt from 'jsonwebtoken';
import { jwtConfig } from '../../config/jwt.config.js';
import db from '../models/index.js';

const { User, Role } = db;

/**
 * Middleware to verify JWT token and authenticate user
 */
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    // Verify the token
    const decoded = jwt.verify(token, jwtConfig.secret);
    
    // Find user in database
    const user = await User.findByPk(decoded.userId, {
      include: [{
        model: Role,
        as: 'role',
        attributes: ['id', 'name']
      }],
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token - user not found'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired'
      });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication'
    });
  }
};

/**
 * Middleware to check if user is admin
 */
export const requireAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!req.user.role) {
      return res.status(403).json({
        success: false,
        message: 'User role not found'
      });
    }

    if (req.user.role.name !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required'
      });
    }

    next();
  } catch (error) {
    console.error('Role verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error in role verification'
    });
  }
};

/**
 * Middleware to check if user is student
 */
export const requireStudent = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!req.user.role) {
      return res.status(403).json({
        success: false,
        message: 'User role not found'
      });
    }

    if (req.user.role.name !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Student role required'
      });
    }

    next();
  } catch (error) {
    console.error('Role verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error in role verification'
    });
  }
};

export default {
  authenticateToken,
  requireAdmin,
  requireStudent
};