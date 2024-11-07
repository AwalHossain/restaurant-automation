# Project Documentation

## Table of Contents
- [Overview](#overview)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Authentication](#authentication)

## Overview
This is a Node.js/TypeScript backend project with multi-role authentication support (Admin, Customer, Rider) and various integrated services.

## Getting Started

### Prerequisites
- Node.js >= 14.x
- TypeScript >= 4.x
- PostgreSQL/MySQL database
- Redis (for caching)
- AWS S3 (for file storage)

### Installation
```bash
# Install dependencies
npm install
```

# Setup environment variables
cp [.env.example](http://_vscodecontentref_/0) .env

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Start development server
npm run dev



## Project Structure
```
src/
├── config/           # Configuration files
│   ├── swagger.ts    # API documentation
│   ├── passport/     # Authentication strategies
│   ├── redis.ts      # Cache configuration
│   ├── s3.ts        # AWS S3 configuration
│   └── socket.ts    # WebSocket setup
├── core/            # Core functionality
│   ├── types/       # TypeScript type definitions
│   └── interfaces/  # Interface definitions

├── modules/         # Feature modules
│   ├── auth/        # Authentication module
│   ├── user/        # User module
│   ├── order/       # Order module
│   └── ...          # Other modules
├── services/        # Integrated services
│   ├── email/       # Email service
│   ├── sms/         # SMS service
│   └── ...
├── utils/           # Utility functions
├── app.ts           # Express app
└── server.ts        # Server entry point
```
## Configuration 
The project uses environment variables for configuration. Create a `.env` file in the root directory and add the following variables:

```bash

NODE_ENV=development
PORT=3000
DATABASE_URL=
REDIS_URL=
AWS_ACCESS_KEY=
AWS_SECRET_KEY=
AWS_BUCKET_NAME=
JWT_SECRET=
```

## Authentication


Authentication
The system supports three types of users:

Admin
Customer
Rider
Each user type has its own:

Authentication strategy
JWT token handling
Route middleware
Role-based permissions
API Documentation
Swagger documentation available at /api-docs
Authentication required for protected routes
JWT token must be included in Authorization header
Caching
Redis is used for caching
Session management
Rate limiting
File Storage
AWS S3 for file uploads
Supported file types: images, documents
File size limits configured in s3.ts
WebSocket
Real-time communication
Event handling for notifications
Socket authentication middleware