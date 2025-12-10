# Backend Deployment Notes - Plan Service Fix

## Issue
The Plan service was not mapping DTO fields to Prisma schema fields, causing "duration_type is missing" errors.

## Fix Applied
Updated `ex-buy-sell-apis/src/plan/plan.service.ts` to map:
- `duration` (DTO) → `duration_type` (Prisma)
- `features` (DTO) → `feature` (Prisma)

## Deployment Steps

1. **Navigate to backend directory:**
   ```bash
   cd ex-buy-sell-apis
   ```

2. **Rebuild the backend:**
   ```bash
   npm run build
   ```
   or
   ```bash
   npm run build:prod
   ```

3. **Restart the backend service:**
   - If using PM2: `pm2 restart ex-buy-sell-apis`
   - If using Docker: Rebuild and restart the container
   - If using systemd: `systemctl restart ex-buy-sell-apis`

4. **Verify the fix:**
   - The compiled JavaScript at `dist/src/plan/plan.service.js` should now include the mapping logic
   - Test creating a plan through the admin dashboard

## Files Changed
- `ex-buy-sell-apis/src/plan/plan.service.ts` - Added field mapping in `create()` and `update()` methods


