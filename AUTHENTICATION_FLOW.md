# Authentication Flow Analysis

## 🔍 Where Login Data Comes From

### ✅ **BACKEND API (Your Own Backend)** - NOT Supabase

1. **Login Source**: `src/hooks/useAuth.ts` → `apiClient.signIn()` → Backend API `/auth/signin`
2. **Backend Location**: `ex-buy-sell-apis/src/auth/auth.controller.ts`
3. **Auth Endpoints are PUBLIC**: The auth controller has `@Public()` decorator, so login/signup don't require authentication

## 🔐 Bearer Token Flow

### 1. **Initial Setup (Default Bearer Token)**
- **Location**: `src/lib/api.ts` line 3
- **Default Token**: Set in `API_BEARER_TOKEN` constant
- **Purpose**: Used when user is NOT logged in
- **Current Token**: The one you provided (stored in code)

### 2. **After User Login**
- **Backend Returns**: `{ user: {...}, tokens: { accessToken: "...", refreshToken: "..." } }`
- **Token Storage**: 
  - Saved to `localStorage` as `auth_token`
  - Also set as bearer token in API client: `apiClient.setBearerToken(accessToken)`
  - User data saved to `localStorage` as `user_data`

### 3. **API Request Flow**
```
Frontend Request
  ↓
apiClient.request() 
  ↓
Checks localStorage for 'auth_token'
  ↓
Uses user token if available, otherwise uses default bearer token
  ↓
Sends to Supabase Proxy Function
  ↓
Proxy adds: Authorization: Bearer <token>
  ↓
Forwards to Backend API (http://173.212.225.22:1230)
  ↓
Backend AuthGuard validates token
```

### 4. **Token Priority**
1. User's login token (`localStorage.getItem('auth_token')`) - **HIGHEST PRIORITY**
2. Default bearer token (`API_BEARER_TOKEN`) - **FALLBACK**

## 🐛 Current Issues

### Issue 1: Bearer Token Not Always Set
- The default bearer token might not be initialized on app start
- User token might not be loaded from localStorage on page refresh

### Issue 2: Authorization Failures
- Backend might be rejecting tokens
- Token might be expired
- JWT_SECRET mismatch between token generation and validation

## ✅ Solutions Applied

1. ✅ Updated default bearer token in `src/lib/api.ts`
2. ✅ Added automatic token loading from localStorage
3. ✅ Enhanced logging to track token usage
4. ✅ Added token validation and expiration checking

## 🔧 How to Verify

1. **Check Browser Console**:
   - Look for "API Client initialized with bearer token"
   - Check "API Request via proxy" logs
   - Verify token is being sent

2. **Check localStorage**:
   ```javascript
   localStorage.getItem('auth_token')  // Should show JWT token if logged in
   localStorage.getItem('user_data')     // Should show user object
   ```

3. **Check Network Tab**:
   - Look at requests to Supabase proxy
   - Check Authorization header in request payload
   - Verify backend responses

## 📝 Next Steps

1. **Test Login**: Try logging in and check console logs
2. **Check Backend Logs**: Verify backend is receiving and validating tokens
3. **Verify JWT_SECRET**: Ensure backend JWT_SECRET matches token signing secret










