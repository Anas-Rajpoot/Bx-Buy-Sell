# Quick Start Guide - Run the Project Locally

This guide will help you get the Art Nest Lab project running on your local machine.

## Prerequisites

Before starting, make sure you have installed:
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **MongoDB** - Either:
  - Local MongoDB installation, OR
  - MongoDB Atlas account (free tier available)
- **Supabase Account** - [Sign up](https://supabase.com) (free tier available)
- **Docker** (optional, for easier setup) - [Download](https://www.docker.com/)

## Step 1: Backend API Setup

### Option A: Using Docker (Recommended - Easiest)

```bash
# Navigate to backend directory
cd ex-buy-sell-apis

# Start all services (API, Redis, RabbitMQ)
docker-compose up
```

This will start:
- Backend API on `http://localhost:1230`
- Redis on port `6379`
- RabbitMQ on ports `5672` and `15672` (management UI)

### Option B: Manual Setup

```bash
# Navigate to backend directory
cd ex-buy-sell-apis

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Create .env file (see environment variables below)
# Then start the backend
npm run start:dev
```

## Step 2: Frontend Setup

```bash
# Navigate to project root (if not already there)
cd ..

# Install dependencies
npm install

# Create .env file (see environment variables below)
# Then start the frontend
npm run dev
```

The frontend will start on `http://localhost:5173` (or another port if 5173 is busy)

## Step 3: Environment Variables

### Backend Environment Variables

Create `ex-buy-sell-apis/.env`:

```env
# Database
DATABASE_URL=mongodb://localhost:27017/ex-buy-sell-db
# OR for MongoDB Atlas:
# DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/ex-buy-sell-db

# Server
PORT=1230
DEFAULT_ROLE=USER

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production

# Redis (if not using Docker)
REDIS_HOST=localhost:6379

# RabbitMQ (if not using Docker)
RABBIT_MQ=localhost:5672

# Email Service (SendGrid - optional for now)
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_SERVICE_FROM=noreply@yourdomain.com

# Agora (for video/voice - optional)
AGORA_APP_ID=your-agora-app-id
AGORA_APP_CERTIFICATE=your-agora-certificate
```

### Frontend Environment Variables

Create `.env` in the project root:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key

# Backend API
VITE_API_BASE_URL=http://localhost:1230
VITE_API_BEARER_TOKEN=your-api-bearer-token-if-needed
```

## Step 4: Supabase Setup

1. **Create a Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and anon key

2. **Run Migrations**:
   ```bash
   # Install Supabase CLI (if not installed)
   npm install -g supabase

   # Login to Supabase
   supabase login

   # Link your project
   supabase link --project-ref your-project-ref

   # Run migrations
   supabase db push
   ```

   OR manually run the SQL migrations from `supabase/migrations/` in the Supabase SQL editor.

3. **Set up Edge Functions**:
   - Go to Supabase Dashboard > Edge Functions
   - Deploy the functions from `supabase/functions/`:
     - `proxy-api`
     - `upload-to-cloudinary`
     - `get-users-with-emails`

## Step 5: MongoDB Setup

### Option A: Local MongoDB

```bash
# Install MongoDB locally
# Then start MongoDB service
mongod

# Or use MongoDB Compass GUI
```

### Option B: MongoDB Atlas (Cloud - Recommended)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string
4. Update `DATABASE_URL` in backend `.env`

## Step 6: Start Everything

### Terminal 1 - Backend API
```bash
cd ex-buy-sell-apis
npm run start:dev
# Should see: "Nest application successfully started"
```

### Terminal 2 - Frontend
```bash
npm run dev
# Should see: "Local: http://localhost:5173"
```

### Terminal 3 - MongoDB (if local)
```bash
mongod
```

## Step 7: Access the Application

1. **Frontend**: Open `http://localhost:5173` in your browser
2. **Backend API**: `http://localhost:1230`
3. **API Documentation (Swagger)**: `http://localhost:1230/api`
4. **RabbitMQ Management** (if using Docker): `http://localhost:15672` (guest/guest)

## Step 8: Test the Application

1. **Create an Account**:
   - Go to `/register` or `/buyer-signup` or `/seller-signup`
   - Fill in the registration form

2. **Login**:
   - Go to `/login`
   - Use your credentials

3. **Create a Listing**:
   - Go to `/dashboard`
   - Follow the 12-step wizard to create a business listing

4. **View Listings**:
   - Go to `/` (home page)
   - Browse available listings

## Troubleshooting

### Backend won't start
- Check if MongoDB is running
- Verify `DATABASE_URL` in `.env` is correct
- Check if port 1230 is available: `netstat -an | grep 1230`
- Look for errors in the terminal

### Frontend won't start
- Check if port 5173 is available
- Verify all environment variables are set
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`

### Database connection errors
- Verify MongoDB is running
- Check connection string format
- For MongoDB Atlas: Ensure your IP is whitelisted

### API calls failing
- Check if backend is running on port 1230
- Verify `VITE_API_BASE_URL` in frontend `.env`
- Check browser console for CORS errors
- Verify Supabase proxy function is deployed

### CORS errors
- Backend has CORS enabled for all origins (`origin: '*'`)
- If issues persist, check Supabase Edge Function proxy configuration

## Quick Test Commands

### Test Backend API
```bash
# Health check (if implemented)
curl http://localhost:1230/

# Get categories
curl http://localhost:1230/category

# Get listings
curl http://localhost:1230/listing
```

### Test Frontend
- Open browser DevTools (F12)
- Check Console for errors
- Check Network tab for API calls

## Next Steps

Once everything is running:
1. Create your first user account
2. Create a test listing
3. Explore the admin dashboard (if you have admin access)
4. Test the chat functionality
5. Review the API documentation at `/api`

## Production Deployment

For production deployment, see `DEPLOYMENT.md` (to be created) or:
- Use Docker Compose for backend
- Deploy frontend to Vercel/Netlify
- Use managed MongoDB Atlas
- Use Supabase production instance












