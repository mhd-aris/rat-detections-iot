import express from 'express';
import { verifyPassword, generateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ message: 'Password diperlukan' });
  }

  if (!verifyPassword(password)) {
    return res.status(401).json({ message: 'Password salah' });
  }

  // Generate token JWT
  const token = generateToken();

  // Set cookie untuk autentikasi halaman web
  res.cookie('authToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 jam
  });

  // Kirim token untuk penggunaan di aplikasi frontend
  res.json({ 
    message: 'Login berhasil',
    token
  });
});

router.post('/logout', (req, res) => {
  res.clearCookie('authToken');
  res.json({ message: 'Logout berhasil' });
});

export default router; 