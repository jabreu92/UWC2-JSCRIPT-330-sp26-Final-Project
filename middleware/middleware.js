import jwt from 'jsonwebtoken';
import { findById } from '../daos/user';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';

export const protect = async (req, res, next) => {
  let token;

  // 1. Check if the header exists and starts with 'Bearer'
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 2. Extract the token from the string "Bearer <token>"
      token = req.headers.authorization.split(' ')[1];

      // 3. Verify the token
      const decoded = jwt.verify(token, JWT_SECRET);

      // 4. Attach the user from the DB to the request (excluding password)
      // This allows you to check req.user.role in the next middleware
      req.user = await findById(decoded.id);

      if (!req.user) {
        return res.status(401).json({ message: 'User no longer exists' });
      }

      next(); // Move to the next function
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

export const authorizeAdmin = (req, res, next) => {
  // Check if req.user exists (from protect) and if they are an admin
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Admins only' });
  }
};