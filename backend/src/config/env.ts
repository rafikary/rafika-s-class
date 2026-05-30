import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  teacherName: process.env.TEACHER_NAME || 'Bu Guru',
  databaseUrl: process.env.DATABASE_URL,
  frontendUrl: process.env.FRONTEND_URL || 'https://rafika-s-class.vercel.app',
  backendUrl: process.env.BACKEND_URL || 'https://rafika-s-class-production.up.railway.app',
};
