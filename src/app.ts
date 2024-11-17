import cors from 'cors';
import express, { Application, NextFunction, Request, Response } from 'express';
// import httpStatus from 'http-status';
import bodyParser from 'body-parser';
import routes from './app/routes';

import cookieParser from 'cookie-parser';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import { prisma } from './shared/prisma';

const app: Application = express();

let origin = ['http://localhost:3000'];

app.use(cors({
  origin: "*", // your frontend URL
  credentials: true, // important for cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));
app.use(cookieParser());

//parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

// health check
app.get('/health', async(req: Request, res: Response) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({
      status: 'ok',
      timestamp: new Date(),
      service: 'university-management-core-service',
      database: 'connected'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date(),
      service: 'university-management-core-service',
      database: 'disconnected',
      error: (error as any).message as string
    });
  }
});

app.use('/api/v1', routes);


//global error handler
app.use(globalErrorHandler);

//handle not found
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    success: false,
    message: 'Not Found',
    errorMessages: [
      {
        path: req.originalUrl,
        message: 'API Not Found',
      },
    ],
  });
  next();
});

export default app;
