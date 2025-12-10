# Supabase vs NestJS Backend Analysis

## Overview
This document identifies all data sources in the project and categorizes them as either:
- **Supabase** (PostgreSQL database via Supabase client)
- **NestJS Backend** (MongoDB database via deployed backend API)

## Summary
**Total Files Using Supabase: 63 files**
**Total Files Using NestJS Backend: ~15 files**

---

## 🔴 CRITICAL: Data Currently Using Supabase (Should Use NestJS Backend)

### 1. Authentication & User Management
**Status: ❌ Using Supabase - Should use NestJS Backend**

#### Files:
- `src/pages/Login.tsx` - Uses `supabase.auth.signInWithPassword()`
- `src/pages/Register.tsx` - Uses `supabase.auth.signUp()`
- `src/pages/BuyerSignup.tsx` - Uses `supabase.auth.signUp()`
- `src/pages/SellerSignup.tsx` - Uses `supabase.auth.signUp()`
- `src/pages/admin/AdminLogin.tsx` - Uses `supabase.auth.signInWithPassword()`
- `src/pages/VerifyAccount.tsx` - Uses Supabase auth
- `src/pages/ForgotPassword.tsx` - Uses Supabase auth
- `src/pages/admin/AdminForgotPassword.tsx` - Uses Supabase auth
- `src/pages/admin/AdminResetPassword.tsx` - Uses Supabase auth
- `src/pages/admin/AdminVerifyOTP.tsx` - Uses Supabase auth

**Backend API Available:**
- ✅ `POST /auth/signup` - User registration
- ✅ `POST /auth/signin` - User login
- ✅ `GET /auth/get-otp/:email` - Get OTP
- ✅ `PUT /auth/verify-otp` - Verify OTP
- ✅ `GET /auth/logout/:id` - Logout

**Action Required:** Replace all Supabase auth calls with `apiClient.signUp()` and `apiClient.signIn()`

---

### 2. User Listings (My Listings Page)
**Status: ❌ Using Supabase - Should use NestJS Backend**

#### Files:
- `src/pages/MyListings.tsx` - Fetches from `supabase.from("listings")`
- `src/hooks/useUserListings.ts` - Fetches from `supabase.from("listings")`

**Backend API Available:**
- ✅ `GET /listing` - Get all listings (with filters)
- ✅ `GET /listing/:id` - Get listing by ID
- ✅ `POST /listing` - Create listing
- ✅ `PATCH /listing/:id` - Update listing
- ✅ `DELETE /listing/:id` - Delete listing

**Action Required:** Replace with `apiClient.getListings({ status: 'PUBLISH' })` and filter by user

---

### 3. User Profile Data
**Status: ❌ Using Supabase - Should use NestJS Backend**

#### Files:
- `src/pages/Profile.tsx` - Fetches/updates from `supabase.from("profiles")`
- `src/hooks/useUserDetails.ts` - Fetches from `supabase.from("profiles")`
- `src/hooks/useUpdateAccount.ts` - Updates Supabase profiles
- `src/hooks/useDeleteAccount.ts` - Deletes from Supabase

**Backend API Available:**
- ✅ `GET /user/:id` - Get user details
- ✅ `PATCH /user/:id` - Update user profile
- ✅ `DELETE /user/:id` - Delete user account

**Action Required:** Replace with `apiClient.getUserById()` and `apiClient.updateUser()`

---

### 4. Favorites
**Status: ❌ Using Supabase - Should use NestJS Backend**

#### Files:
- `src/pages/Favourites.tsx` - Uses Supabase (though currently empty state)
- `src/hooks/useUserFavorites.ts` - Fetches from `supabase.from("favorites")`

**Backend API Available:**
- ⚠️ Need to check if favorites endpoint exists in backend

**Action Required:** Check backend for favorites API, or implement if missing

---

### 5. Chat/Conversations
**Status: ❌ Using Supabase - Should use NestJS Backend**

#### Files:
- `src/pages/Chat.tsx` - Uses Supabase for conversations
- `src/components/chat/ConversationList.tsx` - Fetches from `supabase.from("conversations")`
- `src/components/chat/ChatWindow.tsx` - Uses Supabase for messages
- `src/components/chat/ChatDetails.tsx` - Fetches from Supabase
- `src/hooks/useUserConversations.ts` - Fetches from `supabase.from("conversations")`
- `src/components/admin/chat/AdminConversationList.tsx` - Uses Supabase
- `src/components/admin/chat/AdminChatWindow.tsx` - Uses Supabase
- `src/components/admin/chat/AdminChatDetails.tsx` - Uses Supabase

**Backend API Available:**
- ⚠️ Need to check if chat/conversation endpoints exist in backend

**Action Required:** Check backend for chat API, or implement if missing

---

### 6. Social Accounts
**Status: ⚠️ Mixed - Partially Using Supabase**

#### Files:
- `src/hooks/useAccounts.ts` - Fetches from `supabase.from("social_accounts")`
- `src/hooks/useAddAccount.ts` - Adds to Supabase

**Backend API Available:**
- ✅ Admin can manage social accounts via `/question-admin` (for enabling platforms)
- ⚠️ User's social account links might need separate endpoint

**Action Required:** 
- Admin social account management is correct (enabling platforms)
- User's account links should come from backend if there's an endpoint

---

### 7. Admin Dashboard Data
**Status: ⚠️ Mixed - Some Using Supabase**

#### Files Using Supabase:
- `src/hooks/useAdminListings.ts` - Fetches from `supabase.from("listings")`
- `src/hooks/useAdminUsers.ts` - Fetches from Supabase
- `src/hooks/useAdminDashboardStats.ts` - Fetches from Supabase
- `src/hooks/useAdminRole.ts` - Uses Supabase
- `src/pages/admin/AdminListings.tsx` - Uses Supabase
- `src/pages/admin/AdminListingDetails.tsx` - Uses Supabase

**Backend API Available:**
- ✅ `GET /listing` - Get all listings
- ✅ `GET /listing/:id` - Get listing details
- ⚠️ Need to check for admin user management endpoints

**Action Required:** Replace admin listings with backend API calls

---

### 8. Team Members & Routing
**Status: ❌ Using Supabase - Should use NestJS Backend**

#### Files:
- `src/hooks/useTeamMembers.ts` - Fetches from Supabase
- `src/hooks/useRoutingRules.ts` - Fetches from Supabase

**Backend API Available:**
- ⚠️ Need to check if team members/routing endpoints exist

**Action Required:** Check backend for these APIs

---

### 9. Notifications
**Status: ❌ Using Supabase - Should use NestJS Backend**

#### Files:
- `src/components/NotificationDropdown.tsx` - Fetches from `supabase.from("notifications")`

**Backend API Available:**
- ⚠️ Need to check if notifications endpoint exists

**Action Required:** Check backend for notifications API

---

### 10. Prohibited Words
**Status: ❌ Using Supabase - Should use NestJS Backend**

#### Files:
- `src/components/admin/words/ProhibitedWordsList.tsx` - Uses Supabase
- `src/components/admin/words/EditWordDialog.tsx` - Uses Supabase

**Backend API Available:**
- ⚠️ Need to check if prohibited words endpoint exists

**Action Required:** Check backend for prohibited words API

---

## ✅ CORRECT: Data Using NestJS Backend

### 1. Categories
- ✅ `src/hooks/useCategories.ts` - Uses `apiClient.getCategories()`
- ✅ `src/components/admin/content/AddCategoryDialog.tsx` - Uses backend API
- ✅ `src/components/admin/content/EditCategoryDialog.tsx` - Uses backend API
- ✅ `src/components/admin/content/DeleteCategoryDialog.tsx` - Uses backend API

### 2. Tools/Service Tools
- ✅ `src/hooks/useTools.ts` - Uses `apiClient.getTools()`
- ✅ `src/components/admin/content/AddToolDialog.tsx` - Uses backend API
- ✅ `src/components/admin/content/EditToolDialog.tsx` - Uses backend API
- ✅ `src/components/admin/content/DeleteToolDialog.tsx` - Uses backend API

### 3. Admin Questions (Dynamic Forms)
- ✅ `src/hooks/useBrandQuestions.ts` - Uses `apiClient.getAdminQuestionsByType("BRAND")`
- ✅ `src/hooks/useStatisticQuestions.ts` - Uses backend API
- ✅ `src/hooks/useProductQuestions.ts` - Uses backend API
- ✅ `src/hooks/useManagementQuestions.ts` - Uses backend API
- ✅ `src/hooks/useAdInformationQuestions.ts` - Uses backend API
- ✅ `src/hooks/useHandoverQuestions.ts` - Uses backend API
- ✅ All Add/Edit/Delete question dialogs use backend API

### 4. Plans/Packages
- ✅ `src/hooks/usePlans.ts` - Uses `apiClient.getPlans()`
- ✅ `src/components/admin/content/AddPlanDialog.tsx` - Uses backend API
- ✅ `src/components/admin/content/EditPlanDialog.tsx` - Uses backend API
- ✅ `src/components/admin/content/DeletePlanDialog.tsx` - Uses backend API

### 5. Public Listings (Home Page)
- ✅ `src/components/Listings.tsx` - Uses `apiClient.getListings()`

---

## 📋 Migration Priority List

### High Priority (Core Functionality)
1. **Authentication** - Login, Signup, OTP verification
2. **User Listings** - My Listings page
3. **User Profile** - Profile page and user details

### Medium Priority
4. **Favorites** - User favorites functionality
5. **Admin Listings** - Admin dashboard listings view
6. **Admin Users** - User management in admin dashboard

### Low Priority (May need backend implementation)
7. **Chat/Conversations** - Real-time messaging
8. **Notifications** - User notifications
9. **Team Members** - Admin team management
10. **Routing Rules** - Admin routing configuration
11. **Prohibited Words** - Content moderation

---

## 🔧 Implementation Notes

### Authentication Migration
The backend has JWT-based authentication. After migration:
- Store JWT token in localStorage (already implemented in `apiClient`)
- Use `apiClient.signIn()` instead of `supabase.auth.signInWithPassword()`
- Use `apiClient.signUp()` instead of `supabase.auth.signUp()`
- Remove Supabase auth session checks, use token-based auth instead

### Data Structure Differences
- **Supabase**: Uses PostgreSQL with specific table structures
- **NestJS Backend**: Uses MongoDB with different schema
- May need to adjust data mapping when migrating

### Real-time Features
- Supabase has built-in real-time subscriptions
- Backend may need WebSocket implementation for real-time chat
- Consider keeping Supabase for real-time features if backend doesn't support it

---

## Next Steps
1. Review this analysis
2. Prioritize which features to migrate first
3. Check backend API documentation for missing endpoints
4. Create migration plan for each feature
5. Implement migrations one by one


