# Art Nest Lab - Project Summary

## Overview
**Art Nest Lab** is a full-stack business marketplace platform that enables users to buy and sell businesses online. The platform provides a comprehensive solution for business listings, user management, communication, and administrative oversight.

## Technology Stack

### Frontend
- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 5.4.19
- **UI Library**: shadcn-ui (Radix UI components)
- **Styling**: Tailwind CSS 3.4.17
- **Routing**: React Router DOM 6.30.1
- **State Management**: TanStack React Query 5.83.0
- **Forms**: React Hook Form 7.61.1 with Zod validation
- **Charts**: Recharts 2.15.4

### Backend & Database
- **Backend**: Supabase (PostgreSQL database, Authentication, Storage, Edge Functions)
- **API**: Custom REST API (proxied through Supabase Edge Functions)
- **Authentication**: Supabase Auth with email/password and phone verification

### Key Dependencies
- **UI Components**: Radix UI primitives, Lucide React icons
- **Utilities**: date-fns, clsx, tailwind-merge
- **Other**: Sonner (toast notifications), Embla Carousel

## Project Structure

```
├── src/
│   ├── components/          # React components
│   │   ├── admin/          # Admin-specific components
│   │   ├── chat/           # Chat/messaging components
│   │   ├── dashboard/      # User dashboard components
│   │   ├── listings/       # Listing-related components
│   │   └── ui/             # Reusable UI components (shadcn)
│   ├── pages/              # Page components
│   │   ├── admin/          # Admin pages
│   │   └── [user pages]    # User-facing pages
│   ├── hooks/              # Custom React hooks (50+ hooks)
│   ├── integrations/       # Third-party integrations
│   │   └── supabase/       # Supabase client & types
│   ├── lib/                # Utility libraries
│   └── types/              # TypeScript type definitions
├── supabase/
│   ├── migrations/         # Database migrations (17 files)
│   └── functions/          # Edge Functions
│       ├── get-users-with-emails/
│       ├── proxy-api/
│       └── upload-to-cloudinary/
└── public/                 # Static assets

```

## Core Features

### 1. User Management
- **User Types**: Buyers and Sellers
- **Authentication**: 
  - Email/password registration and login
  - Phone verification with OTP
  - Password reset functionality
  - Account verification
- **User Profiles**: Profile management with user details
- **Role-Based Access**: Admin, Moderator, and regular user roles

### 2. Business Listings
- **Multi-Step Listing Creation**: 12-step wizard for creating business listings
  - Category selection
  - Brand information
  - Tools and integrations
  - Financials
  - Additional information
  - Statistics
  - Products
  - Management details
  - Accounts
  - Ad information
  - Handover process
  - Package selection
- **Listing Features**:
  - Category-based organization
  - Search and filtering
  - Image uploads (Cloudinary integration)
  - Business metrics (revenue, profit, multiples)
  - Location information with country flags
  - Verification status
- **Listing Management**: Users can view, edit, and manage their listings

### 3. Communication System
- **Chat/Messaging**: Real-time chat between buyers and sellers
- **Conversation Management**: 
  - Message history
  - Unread message counts
  - Conversation archiving
- **Admin Chat Assignment**: Admin/moderator assignment to conversations
- **Chat Analytics**: Performance metrics for support team

### 4. Admin Dashboard
Comprehensive admin panel with multiple sections:

#### Dashboard Overview
- Traffic statistics (users, listings, blocked users, revenue)
- Time-based filtering (daily, monthly, yearly)
- Visual charts and analytics

#### User Management
- View all users
- User details and profiles
- User listings, favorites, and chat history
- User blocking/management

#### Listing Management
- View all listings
- Listing details and moderation
- Status management (published, draft, etc.)

#### Team Management
- Admin team member management
- Member details and permissions
- Role assignment

#### Content Management
- Categories management
- Tools management
- Brand questions
- Product questions
- Management questions
- Statistics questions
- Ad information questions
- Handover questions
- Routing rules configuration

#### Monitoring & Analytics
- Chat analytics and performance metrics
- Monitoring alerts
- Word detection and filtering
- Chat list management

### 5. Additional Features
- **Favorites System**: Users can save favorite listings
- **Search Functionality**: Search listings by category, name, or keywords
- **Responsive Design**: Mobile-friendly interface
- **Welcome Dialog**: Onboarding for new users
- **Notification System**: Toast notifications for user feedback

## Database Schema

### Key Tables
- **profiles**: User profile information
- **listings**: Business listings with comprehensive details
- **categories**: Business categories (E-Commerce, Software, Service Business, etc.)
- **tools**: Business tools and platforms (Amazon, Shopify, etc.)
- **conversations**: Chat conversations between users
- **messages**: Individual chat messages
- **user_roles**: Role-based access control
- **favorites**: User favorite listings
- **brand_questions, product_questions, etc.**: Dynamic form questions

### Security Features
- Row Level Security (RLS) policies
- Public views for listings (hides sensitive user data)
- Admin-only functions and views
- Secure conversation views that hide admin metadata from regular users

## API Integration

The application uses a **custom external REST API** that is proxied through Supabase Edge Functions:
- **Base URL**: `http://173.212.225.22:1230` (configurable via environment variables)
- **Authentication**: Bearer token authentication
- **API Endpoints Used**:
  - `/auth/signup` - User registration
  - `/auth/signin` - User login
  - `/listing` - Listing CRUD operations (GET, POST, PATCH, DELETE)
  - `/category` - Category management (GET, POST, PATCH, DELETE)
  - `/service-tool` - Tools management (GET, POST, PATCH, DELETE)
  - `/question-admin` - Admin questions management (GET, POST, PATCH, DELETE)
  - `/upload` - File uploads (direct, not through proxy)
  - `/integration` - Integration management (GET)

### ⚠️ Missing Backend Code
**The external backend API code is NOT included in this repository.** The backend is a separate service that:
- Handles business logic for listings, categories, tools, and questions
- Manages authentication (though Supabase also handles auth)
- Processes file uploads
- Likely written in Node.js, Python, Go, or another backend language
- Runs on a separate server (port 1230)

**To fully understand and complete this project, you would need:**
1. The backend API source code
2. Backend database schema (if different from Supabase)
3. API documentation or OpenAPI/Swagger specs
4. Backend environment configuration

## Supabase Edge Functions

1. **proxy-api**: Proxies requests to external API with authentication
2. **upload-to-cloudinary**: Handles image uploads to Cloudinary
3. **get-users-with-emails**: Retrieves user information with email addresses

## Development Setup

### Prerequisites
- Node.js & npm
- Supabase account and project

### Installation
```bash
npm install
npm run dev
```

### Environment Variables
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY`: Supabase anon key
- `VITE_API_BASE_URL`: External API base URL
- `VITE_API_BEARER_TOKEN`: API bearer token

## Key Components

### User-Facing Components
- **Header**: Navigation and user menu
- **Hero**: Landing page hero section with search
- **Listings**: Business listings display with filtering
- **ListingCard**: Individual listing card component
- **Dashboard**: Multi-step listing creation wizard
- **Chat**: Real-time messaging interface

### Admin Components
- **AdminDashboard**: Overview with statistics and charts
- **AdminSidebar**: Navigation for admin panel
- **AdminHeader**: Admin panel header
- **StatCard**: Statistics display cards
- **Charts**: Various analytics charts (Visitors, Revenue, Listings, etc.)

## Custom Hooks

The project includes 50+ custom React hooks for:
- Data fetching (useUserListings, useCategories, etc.)
- CRUD operations (useAddCategory, useUpdateTool, etc.)
- Admin operations (useAdminDashboardStats, useAdminUsers, etc.)
- User operations (useUserDetails, useUserFavorites, etc.)

## Styling & Design

- **Design System**: shadcn-ui component library
- **Theme**: Customizable with Tailwind CSS
- **Icons**: Lucide React icon library
- **Animations**: Tailwind CSS animations
- **Responsive**: Mobile-first design approach

## Security Considerations

- Row Level Security (RLS) on all database tables
- Public views that hide sensitive information
- Admin-only functions and views
- Secure API proxy through Supabase
- Authentication required for protected routes
- Role-based access control

## Future Enhancements (Based on Code Structure)

- Enhanced analytics and reporting
- Advanced search and filtering
- Email notifications
- Payment integration
- Business verification system
- Advanced chat features (file sharing, etc.)

## Architecture Overview

### Complete System ✅

1. **Frontend Application** (React/TypeScript)
   - Complete UI components and pages
   - All user-facing features
   - Admin dashboard
   - 50+ custom hooks for data operations

2. **Backend API** (NestJS/TypeScript) - `ex-buy-sell-apis/`
   - REST API server (port 1230)
   - MongoDB database via Prisma
   - JWT authentication
   - Role-based access control
   - Real-time chat via WebSocket
   - File upload handling
   - Redis caching
   - RabbitMQ message queue
   - See `BACKEND_SUMMARY.md` for details

3. **Supabase Backend**
   - PostgreSQL database schema (17 migrations)
   - Authentication system (separate from backend API)
   - Row Level Security policies
   - 3 Edge Functions (proxy, upload, user retrieval)
   - Real-time capabilities

4. **Edge Functions**
   - `proxy-api`: Proxies requests to external API
   - `upload-to-cloudinary`: Image upload handler
   - `get-users-with-emails`: Admin user retrieval

### System Architecture

The application uses a **hybrid backend approach**:
- **NestJS Backend API** (port 1230) - Main business logic, MongoDB
- **Supabase** - PostgreSQL database, additional auth, Edge Functions
- **Frontend** - React app that communicates with both backends

**Note**: The system uses two separate databases:
- MongoDB (NestJS backend) - Main application data
- PostgreSQL (Supabase) - User profiles, conversations, listings (some overlap)

## Complete Project Structure

```
art-nest-lab-main/
├── src/                    # Frontend (React/TypeScript)
├── supabase/              # Supabase config & migrations
├── ex-buy-sell-apis/      # Backend API (NestJS/TypeScript)
│   ├── src/              # Backend source code
│   ├── prisma/           # Database schema (MongoDB)
│   ├── docker-compose.yml
│   └── package.json
└── public/                # Static assets
```

## Notes

- The project was built using Lovable.dev platform
- **Complete full-stack application** with frontend and backend
- Uses **dual database system**:
  - MongoDB (NestJS backend) - Main application data
  - PostgreSQL (Supabase) - User profiles, conversations, some listings
- **Dual authentication**:
  - Supabase Auth (frontend)
  - JWT Auth (NestJS backend)
- Cloudinary integration for image management
- Comprehensive admin panel for platform management
- Real-time chat via WebSocket
- Redis caching and RabbitMQ message queue
- See `BACKEND_SUMMARY.md` for detailed backend documentation


