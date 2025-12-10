# Backend API Requirements

This document lists all the API endpoints that the frontend expects from the external backend API (running on port 1230).

## Base Configuration
- **Base URL**: `http://173.212.225.22:1230` (or configurable via `VITE_API_BASE_URL`)
- **Authentication**: Bearer token in `Authorization` header
- **Content-Type**: `application/json` for most endpoints
- **Proxy**: All requests go through Supabase Edge Function `proxy-api`

## API Endpoints

### Authentication Endpoints

#### POST `/auth/signup`
User registration
```typescript
Request Body: {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm_password: string;
  user_type?: string; // "buyer" | "seller"
}

Response: {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
}
```

#### POST `/auth/signin`
User login
```typescript
Request Body: {
  email: string;
  password: string;
}

Response: {
  success: boolean;
  data?: {
    token?: string;
    user?: any;
  };
  message?: string;
  error?: string;
}
```

### Listing Endpoints

#### GET `/listing`
Get all listings with optional filters
```typescript
Query Parameters: {
  page?: number;
  limit?: number;
  category?: string;
  status?: string; // e.g., "PUBLISH"
}

Response: {
  success: boolean;
  data?: Array<{
    id: string;
    title?: string;
    description?: string;
    price?: string;
    location?: string;
    image_url?: string;
    category?: Array<{ name: string }>;
    brand?: Array<{ businessName: string }>;
    status?: string;
    // ... other listing fields
  }>;
  error?: string;
}
```

#### GET `/listing/:id`
Get a single listing by ID
```typescript
Response: {
  success: boolean;
  data?: Listing;
  error?: string;
}
```

#### POST `/listing`
Create a new listing
```typescript
Request Body: {
  // Complex listing object with all 12-step form data
  category_id?: string;
  brand?: any;
  tools?: any[];
  financials?: any;
  // ... all other listing fields
}

Response: {
  success: boolean;
  data?: Listing;
  error?: string;
}
```

#### PATCH `/listing/:id`
Update an existing listing
```typescript
Request Body: {
  // Partial listing object
}

Response: {
  success: boolean;
  data?: Listing;
  error?: string;
}
```

#### DELETE `/listing/:id`
Delete a listing
```typescript
Response: {
  success: boolean;
  message?: string;
  error?: string;
}
```

### Category Endpoints

#### GET `/category`
Get all categories
```typescript
Response: {
  success: boolean;
  data?: Array<{
    id: string;
    name: string;
    image_path?: string;
    icon?: string;
    bg_color?: string;
    icon_color?: string;
  }>;
  error?: string;
}
```

#### POST `/category`
Create a new category
```typescript
Request Body: {
  name: string;
  image_path?: string;
}

Response: {
  success: boolean;
  data?: Category;
  error?: string;
}
```

#### PATCH `/category/:id`
Update a category
```typescript
Request Body: {
  name?: string;
  image_path?: string;
}

Response: {
  success: boolean;
  data?: Category;
  error?: string;
}
```

#### DELETE `/category/:id`
Delete a category
```typescript
Response: {
  success: boolean;
  message?: string;
  error?: string;
}
```

### Tools Endpoints

#### GET `/service-tool`
Get all tools
```typescript
Response: {
  success: boolean;
  data?: Array<{
    id: string;
    name: string;
    image_path: string;
    logo?: string;
    highlighted?: boolean;
  }>;
  error?: string;
}
```

#### POST `/service-tool`
Create a new tool
```typescript
Request Body: {
  name: string;
  image_path: string;
}

Response: {
  success: boolean;
  data?: Tool;
  error?: string;
}
```

#### PATCH `/service-tool/:id`
Update a tool
```typescript
Request Body: {
  name?: string;
  image_path?: string;
}

Response: {
  success: boolean;
  data?: Tool;
  error?: string;
}
```

#### DELETE `/service-tool/:id`
Delete a tool
```typescript
Response: {
  success: boolean;
  message?: string;
  error?: string;
}
```

### Admin Questions Endpoints

#### GET `/question-admin`
Get all admin questions
```typescript
Query Parameters: {
  answer_for?: string; // Filter by question type (brand, product, management, etc.)
}

Response: {
  success: boolean;
  data?: Array<{
    id: string;
    question: string;
    answer_type: string; // "text" | "number" | "select" | etc.
    answer_for: string; // "brand" | "product" | "management" | "statistics" | "ad_information" | "handover"
    option?: any[]; // For select/dropdown types
  }>;
  error?: string;
}
```

#### POST `/question-admin`
Create a new admin question
```typescript
Request Body: {
  question: string;
  answer_type: string;
  answer_for: string;
  option?: any[];
}

Response: {
  success: boolean;
  data?: Question;
  error?: string;
}
```

#### PATCH `/question-admin/:id`
Update an admin question
```typescript
Request Body: {
  question?: string;
  answer_type?: string;
  answer_for?: string;
  option?: any[];
}

Response: {
  success: boolean;
  data?: Question;
  error?: string;
}
```

#### DELETE `/question-admin/:id`
Delete an admin question
```typescript
Response: {
  success: boolean;
  message?: string;
  error?: string;
}
```

### Integration Endpoints

#### GET `/integration`
Get all integrations
```typescript
Response: {
  success: boolean;
  data?: Array<{
    id: string;
    name: string;
    logo: string;
  }>;
  error?: string;
}
```

### File Upload Endpoint

#### POST `/upload`
Upload a file (photo or attachment)
```typescript
Request: FormData {
  file: File;
  type: "photo" | "attachment";
}

Headers: {
  Authorization: "Bearer <token>";
  // Note: No Content-Type header (browser sets it for FormData)
}

Response: {
  success: boolean;
  data?: {
    url?: string;
    path?: string;
    // ... other upload response fields
  };
  error?: string;
}
```

## Error Handling

All endpoints should return consistent error responses:
```typescript
{
  success: false;
  error: string; // Error message
  message?: string; // Optional additional message
}
```

## Authentication Flow

1. User signs up/logs in via `/auth/signup` or `/auth/signin`
2. Backend returns a token (if applicable)
3. Token is stored in localStorage as `auth_token`
4. Subsequent requests include token in `Authorization: Bearer <token>` header
5. Token is passed through the Supabase proxy function

## Notes

- All requests are proxied through Supabase Edge Function `proxy-api`
- The proxy adds the `Authorization: Bearer <VITE_API_BEARER_TOKEN>` header
- User tokens (from login) are also included when available
- The backend API must handle CORS properly (or rely on the proxy)
- File uploads go directly to the backend (not through proxy) when using `apiClient.uploadFile()`

## Implementation Status

**⚠️ The backend API code is NOT included in this repository.**

To complete the project, you need to implement:
1. All the endpoints listed above
2. Database models and schemas
3. Authentication middleware
4. Business logic for listings, categories, tools, and questions
5. File upload handling
6. Error handling and validation

