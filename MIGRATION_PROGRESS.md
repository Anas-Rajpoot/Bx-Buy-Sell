# Migration Progress: Supabase → NestJS Backend

## ✅ Completed

### 1. Authentication System
- ✅ Created `useAuth` hook for JWT-based authentication
- ✅ Updated `api.ts` to store tokens and user data on login/signup
- ✅ Migrated `Login.tsx` to use backend API
- ✅ Migrated `Register.tsx` to use backend API
- ✅ Migrated `BuyerSignup.tsx` to use backend API
- ✅ Migrated `SellerSignup.tsx` to use backend API
- ✅ Added user management API methods (`getUserById`, `updateUser`, `deleteUser`)
- ✅ Added favorites API methods (`getFavorites`, `addFavorite`, `removeFavorite`)
- ✅ Added auth helper methods (`getOTP`, `verifyOTP`, `logout`)

## 🚧 In Progress

### 2. User Listings
- ⏳ Need to migrate `MyListings.tsx` to use `apiClient.getListings()` with user filter
- ⏳ Need to migrate `useUserListings.ts` hook

### 3. User Profile
- ⏳ Need to migrate `Profile.tsx` to use `apiClient.getUserById()` and `apiClient.updateUser()`
- ⏳ Need to migrate `useUserDetails.ts` hook

### 4. Favorites
- ⏳ Need to migrate `Favourites.tsx` to use `apiClient.getFavorites()`
- ⏳ Need to migrate `useUserFavorites.ts` hook

### 5. Admin Listings
- ⏳ Need to migrate `useAdminListings.ts` to use `apiClient.getListings()`
- ⏳ Need to migrate `AdminListings.tsx` page

## 📋 Pending

### 6. Chat/Conversations
- ⚠️ Need to check if backend has chat endpoints
- ⚠️ May need WebSocket implementation for real-time

### 7. Notifications
- ⚠️ Need to check if backend has notifications endpoints

### 8. Auth Session Management
- ⏳ Replace all `supabase.auth.getSession()` checks with JWT token checks
- ⏳ Update all components that check auth state
- ⏳ Update `Header.tsx`, `Dashboard.tsx`, and other components

### 9. Admin Authentication
- ⏳ Migrate `AdminLogin.tsx` to use backend API
- ⏳ Update admin role checking logic

### 10. OTP Verification
- ⏳ Migrate `VerifyAccount.tsx` to use backend OTP endpoints
- ⏳ Migrate `ForgotPassword.tsx` to use backend API

## 🔧 Technical Notes

### Token Storage
- Tokens are stored in `localStorage` as `auth_token`
- User data is stored in `localStorage` as `user_data`
- `apiClient` automatically includes token in requests via `Authorization` header

### Backend API Endpoints Used
- `POST /auth/signup` - User registration
- `POST /auth/signin` - User login
- `GET /auth/get-otp/:email` - Get OTP
- `PUT /auth/verify-otp` - Verify OTP
- `GET /auth/logout/:id` - Logout
- `GET /user/:id` - Get user details
- `PATCH /user/:id` - Update user
- `DELETE /user/:id` - Delete user
- `GET /user/favourite` - Get favorites
- `GET /user/favourite/add/:listingId` - Add favorite
- `GET /user/favourite/remove/:listingId` - Remove favorite
- `GET /listing` - Get listings (with filters)
- `POST /listing` - Create listing
- `PATCH /listing/:id` - Update listing
- `DELETE /listing/:id` - Delete listing

### Breaking Changes
- Removed Supabase auth dependency from login/signup pages
- Changed from session-based auth to token-based auth
- User data structure may differ between Supabase and backend

