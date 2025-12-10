# Why Are Requests Going Through Supabase?

## Current Setup

**All API requests are routed through Supabase Edge Function `proxy-api`**

### Flow:
```
Frontend (Browser)
    ↓
Supabase Edge Function (proxy-api)
    ↓
Your Backend API (http://173.212.225.22:1230)
```

## Why Supabase Proxy?

1. **CORS Issues** - Browsers block direct requests to different origins
2. **Security** - Hides backend URL from frontend
3. **Authentication** - Adds bearer token automatically
4. **Error Handling** - Centralized error handling

## The Problem

The Supabase proxy is causing issues because:
- It adds an extra layer that can fail
- Token might not be forwarded correctly
- Extra latency
- More complex debugging

## Solution: Call Backend Directly

We can bypass Supabase and call your backend API directly!

### Benefits:
- ✅ Faster (no proxy layer)
- ✅ Simpler debugging
- ✅ Direct control over requests
- ✅ No Supabase dependency for API calls

### Requirements:
- Backend must have CORS enabled
- Backend must be accessible from browser










