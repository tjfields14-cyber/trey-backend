import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import treyRouter from "./trey/routes/treyRoute.js";
import { createTrackingMiddleware } from "./middleware/trackingMiddleware.js";
import { errorHandler, notFoundHandler, setupGracefulShutdown } from "./middleware/errorMiddleware.js";
import { schedulerService } from "./services/schedulerService.js";

const app = express();
const port = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? process.env.ALLOWED_ORIGINS?.split(',') || false
    : true, // Allow all in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/trey', limiter);

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth attempts per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.'
  },
});

// Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Tracking middleware (after security middleware)
app.use(createTrackingMiddleware({
  trackRequestBody: false,
  trackResponseBody: false,
  excludeEndpoints: ['/health', '/auth/login']
}));

// Routes
app.use("/trey", treyRouter);

// Health check (before 404 handler)
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "fractured-backend",
    time: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root route
app.get("/", (req, res) => {
  res.send("Fractured backend is running");
});

// 404 handler
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

// Initialize scheduler
const defaultScheduleTime = process.env.DAILY_ANALYSIS_TIME || '02:00';
try {
  schedulerService.scheduleDailyAnalysis(defaultScheduleTime);
  console.log(`Daily analysis scheduled for ${defaultScheduleTime}`);
} catch (error) {
  console.error('Failed to schedule daily analysis:', error);
}

// Setup graceful shutdown
setupGracefulShutdown(app);

// Start server
app.listen(port, "0.0.0.0", () => {
  console.log(`Fractured backend listening on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});