# Backend API Summary - ex-buy-sell-apis

## Overview
The backend is a **NestJS** (Node.js) application that provides REST API endpoints for the Art Nest Lab marketplace platform. It uses **MongoDB** as the database (via Prisma ORM) and runs on port **1230**.

## Technology Stack

### Framework & Core
- **NestJS** 11.1.3 - Progressive Node.js framework
- **TypeScript** 5.7.3
- **Prisma** 6.11.0 - MongoDB ORM
- **MongoDB** - NoSQL database

### Key Dependencies
- **@nestjs/jwt** - JWT authentication
- **@nestjs/passport** - Authentication strategies
- **bcrypt** - Password hashing
- **@nestjs/swagger** - API documentation
- **@nestjs/cache-manager** - Caching (Redis)
- **@nestjs/bullmq** - Job queues
- **socket.io** - WebSocket support for real-time chat
- **multer** - File uploads
- **zod** - Schema validation
- **@sendgrid/mail** - Email service
- **ioredis** - Redis client
- **amqplib** - RabbitMQ client

### Infrastructure
- **Redis** - Caching and session management
- **RabbitMQ** - Message queue for async operations
- **Docker** - Containerization

## Project Structure

```
ex-buy-sell-apis/
├── src/
│   ├── auth/              # Authentication module
│   ├── user/              # User management
│   ├── listing/           # Business listings
│   ├── category/           # Categories
│   ├── service-tool/       # Tools/integrations
│   ├── question-admin/    # Admin questions
│   ├── chat/               # Chat/messaging
│   ├── support/            # Support tickets
│   ├── plan/               # Subscription plans
│   ├── niche/              # Business niches
│   ├── financial-admin/    # Financial admin
│   ├── prohibited-word/   # Word filtering
│   ├── activity-log/       # Activity logging
│   ├── email-template/     # Email templates
│   ├── prisma/             # Prisma service
│   ├── redis-adapter/      # Redis adapter
│   ├── rabbit-mq/          # RabbitMQ service
│   └── common/             # Shared utilities
│       ├── decorator/      # Custom decorators
│       ├── guard/          # Auth & role guards
│       ├── interceptor/    # HTTP interceptors
│       ├── validator/      # Validation pipes
│       └── enum/           # Enums
├── prisma/
│   └── schema.prisma       # Database schema
├── uploads/                # Uploaded files
├── docker-compose.yml      # Docker setup
└── Dockerfile              # Container config
```

## API Endpoints

### Authentication (`/auth`)
- `POST /auth/signup` - User registration
- `POST /auth/signin` - User login
- `GET /auth/logout/:id` - Logout
- `GET /auth/get-otp/:email` - Get OTP for verification
- `PUT /auth/verify-otp` - Verify OTP
- `PATCH /auth/refresh/:id` - Refresh JWT tokens

### Listings (`/listing`)
- `GET /listing` - Get all listings (cached)
- `GET /listing/:id` - Get listing by ID (cached)
- `POST /listing` - Create new listing (requires auth)
- `PATCH /listing/:id` - Update listing (requires auth)
- `DELETE /listing/:id` - Delete listing

### Categories (`/category`)
- `GET /category` - Get all categories (cached, public)
- `GET /category/:id` - Get category by ID
- `POST /category` - Create category (Admin/Monitor only)
- `PATCH /category/:id` - Update category (Admin/Monitor only)
- `DELETE /category/:id` - Delete category (Admin/Monitor only)

### Service Tools (`/service-tool`)
- `GET /service-tool` - Get all tools (cached, public)
- `GET /service-tool/:id` - Get tool by ID (cached)
- `POST /service-tool` - Create tool (Admin/Monitor/Staff only)
- `PUT /service-tool/:id` - Update tool (Admin/Monitor/Staff only)
- `DELETE /service-tool/:id` - Delete tool (Admin/Monitor/Staff only)

### Admin Questions (`/question-admin`)
- `GET /question-admin` - Get all questions
- `GET /question-admin/:id` - Get question by ID
- `GET /question-admin/type/:type` - Get questions by type
- `POST /question-admin` - Create question (Admin/Monitor/Staff/User)
- `PATCH /question-admin/:id` - Update question
- `DELETE /question-admin/:id` - Delete question

### Other Modules
- **Chat** - Real-time messaging via WebSocket
- **Support** - Support ticket system
- **Plan** - Subscription plans
- **Niche** - Business niches
- **Financial Admin** - Financial management
- **Prohibited Word** - Content filtering
- **Activity Log** - Activity tracking

## Database Schema (MongoDB via Prisma)

### Key Models
- **User** - User accounts with roles (ADMIN, SELLER, USER, MONITER)
- **Listing** - Business listings with status (PUBLISH, DRAFT)
- **Category** - Business categories
- **ServiceTool** - Tools/integrations
- **AdminQuestion** - Dynamic form questions
- **Chat** - Chat conversations
- **Message** - Chat messages
- **Favourite** - User favorites
- **SupportTicket** - Support tickets
- **ActivityLog** - Activity tracking
- **Plan** - Subscription plans

### Enums
- **Role**: ADMIN, SELLER, USER, MONITER
- **ListingStatus**: PUBLISH, DRAFT
- **ChatStatus**: ACTIVE, CLOSED, FLAGGED, ARCHIVED
- **AnswerType**: TEXT, NUMBER, BOOLEAN, SELECT, DATE, FILE, PHOTO
- **AnswerFor**: BRAND, PRODUCT, MANAGEMENT, STATISTIC, HANDOVER, SOCIAL, ADVERTISMENT
- **TicketStatus**: OPEN, CLOSED, PENDING

## Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (RBAC)
- Password hashing with bcrypt
- OTP verification for email/phone
- Refresh token support

### Caching
- Redis-based caching for frequently accessed data
- Cache invalidation on updates
- Configurable TTL

### File Uploads
- Multer for file handling
- Local file storage in `uploads/` directory
- Image upload support for categories and tools

### Real-time Features
- WebSocket support via Socket.IO
- Redis adapter for multi-instance support
- Real-time chat messaging

### Message Queue
- RabbitMQ integration for async operations
- Activity log queue
- Background job processing

### Validation
- Zod schema validation
- Custom validation pipes
- Request/response transformation

### API Documentation
- Swagger/OpenAPI documentation
- Available at `/api` endpoint
- JSON schema at `/swagger/json`

## Security Features

### Guards
- **AuthGuard** - JWT token validation
- **RolesGuard** - Role-based access control

### Decorators
- `@Public()` - Bypass authentication
- `@Roles(['ADMIN', 'USER'])` - Role restrictions
- `@StandardResponse()` - Standardized responses
- `@StandardError()` - Error handling

### Interceptors
- **ResponseInterceptor** - Standardize API responses
- **HttpExceptionFilter** - Global error handling
- **LogInterceptor** - Request logging

## Environment Variables

Required environment variables:
```env
DATABASE_URL=mongodb://...
PORT=1230
JWT_SECRET=...
JWT_REFRESH_SECRET=...
RABBIT_MQ=rabbitmq:5672
REDIS_HOST=redis:6379
SENDGRID_API_KEY=...
AGORA_APP_ID=...
AGORA_APP_CERTIFICATE=...
```

## Docker Setup

The backend includes Docker configuration:
- **docker-compose.yml** - Development setup
- **docker-compose-prod.yml** - Production setup
- **Dockerfile** - Multi-stage build

Services:
- **api** - NestJS application (port 1230)
- **redis** - Redis cache (port 6379)
- **rabbitmq** - Message queue (ports 5672, 15672)

## Development

### Setup
```bash
cd ex-buy-sell-apis
npm install
npx prisma generate
npm run start:dev
```

### Database
```bash
# Generate Prisma client
npm run db:gen

# Push schema changes
npm run db:push

# Run migrations
npm run db:migrate

# Open Prisma Studio
npm run db:studio
```

### Testing
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

## API Response Format

Standard response format:
```typescript
{
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
}
```

## Integration with Frontend

The frontend communicates with this backend through:
1. **Direct API calls** (proxied through Supabase Edge Function)
2. **Supabase proxy-api function** - Handles CORS and authentication
3. **WebSocket** - For real-time chat features

## Notes

- Uses MongoDB (not PostgreSQL like Supabase)
- Separate database from Supabase
- JWT authentication (separate from Supabase Auth)
- File uploads stored locally in `uploads/` directory
- Redis caching for performance
- RabbitMQ for async job processing
- Swagger documentation available
- Postman collection included

