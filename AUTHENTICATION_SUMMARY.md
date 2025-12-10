# 🔐 Authentication & Authorization Summary

## ✅ **CONFIRMED: Login Data Comes From YOUR BACKEND API**

### Authentication Source
- **NOT Supabase** - Supabase is only used for the proxy function
- **YOUR BACKEND API** - Located at `ex-buy-sell-apis/src/auth/`
- **Login Endpoint**: `/auth/signin` (POST)
- **Signup Endpoint**: `/auth/signup` (POST)

### Flow Diagram
```
User Login Form
    ↓
useAuth.login() hook
    ↓
apiClient.signIn() → Backend API /auth/signin
    ↓
Backend validates credentials
    ↓
Returns: { user: {...}, tokens: { accessToken, refreshToken } }
    ↓
Frontend stores:
  - auth_token (JWT) in localStorage
  - user_data in localStorage
  - Sets bearer token in API client
```

## 🔑 Bearer Token Configuration

### 1. **Default Bearer Token (For Non-Logged-In Users)**
- **Location**: `src/lib/api.ts` line 3
- **Token**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (Your provided token)
- **Purpose**: Used when making API calls without user login
- **Status**: ✅ **SET AND CONFIGURED**

### 2. **User Login Token (After Login)**
- **Source**: Backend API `/auth/signin` response
- **Storage**: `localStorage.getItem('auth_token')`
- **Priority**: **HIGHEST** - Used over default token when available
- **Auto-Loading**: ✅ **CONFIGURED** - Automatically loads on app start

### 3. **Token Priority Order**
1. **User's login token** (from localStorage) - **HIGHEST PRIORITY**
2. **Default bearer token** (from API_BEARER_TOKEN) - **FALLBACK**

## 🔧 What I Fixed

### ✅ 1. Bearer Token Initialization
- Added automatic token loading on app start
- Checks localStorage first, then uses default token
- Added storage event listener for token changes

### ✅ 2. Enhanced Logging
- Added detailed console logs for:
  - Token initialization
  - Login process
  - API requests with token info
  - Token expiration checking

### ✅ 3. Backend Query Parameters
- Fixed listing endpoint to accept `status`, `category`, `page`, `limit` filters
- Backend now properly filters by status (PUBLISH/DRAFT)

### ✅ 4. Token Management
- Automatic token refresh from localStorage
- Proper token setting after login
- Token validation and expiration checking

## 📍 Where Bearer Token is Set

### **Frontend (`src/lib/api.ts`)**
```typescript
// Line 3: Default bearer token constant
const API_BEARER_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

// Line 785-820: Initialization function
function initializeBearerToken() {
  const userToken = localStorage.getItem('auth_token');
  if (userToken) {
    // Use user's login token
    apiClient.setBearerToken(userToken);
  } else {
    // Use default bearer token
    apiClient.setBearerToken(API_BEARER_TOKEN);
  }
}
```

### **API Request Flow (`src/lib/api.ts` line 74)**
```typescript
// Priority order:
const finalBearerToken = 
  userAuthToken ||           // 1. User's login token
  this.bearerToken ||        // 2. Set bearer token
  API_BEARER_TOKEN;          // 3. Default token
```

### **Supabase Proxy (`supabase/functions/proxy-api/index.ts` line 32)**
```typescript
// Uses bearer token from request body
const API_TOKEN = bearerToken || Deno.env.get('VITE_API_BEARER_TOKEN');
// Adds to Authorization header
headers: {
  'Authorization': `Bearer ${API_TOKEN}`
}
```

### **Backend Validation (`ex-buy-sell-apis/common/guard/auth.guard.ts`)**
```typescript
// Extracts token from Authorization header
const token = this.extractTokenFromHeader(request);
// Validates with JWT_SECRET
const payload = await this.jwtService.verifyAsync(token, {
  secret: process.env.JWT_SECRET,
});
```

## 🚀 How to Test

### 1. **Check Bearer Token is Set**
Open browser console and look for:
```
✅ API Client initialized with DEFAULT bearer token: { ... }
```

### 2. **Test Login**
1. Go to `/login`
2. Enter credentials
3. Check console for:
```
🔐 Attempting login for: your@email.com
✅ Login successful! Token details: { userId, email, role, exp }
```

### 3. **Verify API Calls**
Check Network tab → Supabase proxy requests:
- Request payload should have `bearerToken` field
- Backend should receive `Authorization: Bearer <token>` header

### 4. **Check localStorage**
```javascript
// In browser console:
localStorage.getItem('auth_token')  // Should show JWT if logged in
localStorage.getItem('user_data')   // Should show user object
```

## ⚠️ Troubleshooting

### Issue: "Not Authorized" Errors

**Possible Causes:**
1. **Token Expired**: Check token expiration in console logs
2. **JWT_SECRET Mismatch**: Backend JWT_SECRET must match token signing secret
3. **Token Not Sent**: Check Network tab to verify token in request
4. **Backend Not Running**: Ensure backend is running on port 1230

**Solutions:**
1. Check browser console for token details
2. Verify backend `.env` has correct `JWT_SECRET`
3. Try logging in again to get fresh token
4. Check backend logs for validation errors

### Issue: "No Listings Found"

**Possible Causes:**
1. No listings in database
2. All listings have status `DRAFT` (not `PUBLISH`)
3. Backend filtering not working

**Solutions:**
1. Check backend database for listings
2. Try fetching without status filter: `apiClient.getListings()`
3. Check backend logs for query execution

## 📝 Next Steps

1. ✅ **Backend is starting** - Check if it's running on `http://localhost:1230`
2. ✅ **Bearer token is configured** - Should work automatically
3. 🔍 **Test login** - Try logging in and check console logs
4. 🔍 **Check backend logs** - Verify token validation is working
5. 🔍 **Test API calls** - Make a request and verify authorization

## 🎯 Key Points

- ✅ **Login = YOUR BACKEND** (not Supabase)
- ✅ **Bearer Token = SET** (default token configured)
- ✅ **Auto-Loading = ENABLED** (loads from localStorage)
- ✅ **Token Priority = USER TOKEN > DEFAULT TOKEN**
- ✅ **Backend Filtering = FIXED** (status, category, pagination)










