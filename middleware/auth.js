import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'rat_detection_secret_key';
const DEFAULT_PASSWORD = process.env.DEFAULT_PASSWORD || 'default_password';

// Middleware untuk autentikasi API
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token autentikasi diperlukan' });
  }

  try {
    const user = jwt.verify(token, JWT_SECRET);
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token tidak valid' });
  }
};

// Middleware untuk halaman web
export const authenticatePage = (req, res, next) => {
  const token = req.cookies?.authToken;
  
  // Skip autentikasi untuk halaman login
  if (req.path === '/login.html' || req.path === '/api/auth/login') {
    return next();
  }
  
  // Jika tidak ada token, redirect ke halaman login
  if (!token) {
    return res.redirect('/login.html');
  }

  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch (error) {
    res.clearCookie('authToken');
    return res.redirect('/login.html');
  }
};

// Fungsi untuk memeriksa password
export const verifyPassword = (password) => {
  return password === DEFAULT_PASSWORD;
};

// Fungsi untuk generate token
export const generateToken = (userId = 'admin') => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '24h' });
}; 