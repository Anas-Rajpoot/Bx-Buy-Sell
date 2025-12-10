# Deployment Instructions - Managed by EX Cache Fix

## 🚨 Important
Your backend is running on a **remote server** (`173.212.225.22:1230`), so the changes made to local files won't take effect until you deploy them to the server.

## 📝 What Was Changed

### Backend File Modified:
**File:** `ex-buy-sell-apis/src/listing/listing.controller.ts`

**Lines 123-130:** Added cache invalidation logic in the `update` method

```typescript
// Invalidate all listing caches - both the specific listing and all findAll queries
await this.cacheManager.del(`${this.constructor.name}:${id}`);
// Note: Cache manager doesn't support pattern deletion, so we clear the base key
// This will force fresh fetches on next request
await this.cacheManager.del(`${this.constructor.name}`);

console.log(`🗑️ Cache invalidated for listing ${id} and all listing queries`);
console.log(`✅ Updated listing data includes managed_by_ex: ${data.managed_by_ex}`);
```

## 🚀 Deployment Steps

### Option 1: Deploy via Git (If using version control)

1. **Commit the changes:**
   ```bash
   cd ex-buy-sell-apis
   git add src/listing/listing.controller.ts
   git commit -m "Fix: Add cache invalidation for managed_by_ex updates"
   git push
   ```

2. **On your server, pull the changes:**
   ```bash
   cd /path/to/your/backend
   git pull
   npm install  # If new dependencies were added
   npm run build  # Build the project
   pm2 restart all  # Or however you restart your server
   ```

### Option 2: Manual Upload (If not using Git)

1. **Build the project locally:**
   ```bash
   cd ex-buy-sell-apis
   npm run build
   ```
   This creates the `dist/` folder with compiled JavaScript.

2. **Upload to server:**
   - Upload the entire `ex-buy-sell-apis/` folder to your server
   - OR upload just the changed file: `src/listing/listing.controller.ts`
   - OR upload the compiled file: `dist/src/listing/listing.controller.js`

3. **On your server:**
   ```bash
   # Navigate to backend directory
   cd /path/to/your/backend
   
   # If you uploaded source files, rebuild:
   npm run build
   
   # Restart the server
   pm2 restart all
   # OR
   npm run start:prod
   # OR however you normally restart your server
   ```

### Option 3: Direct File Edit on Server

If you have SSH access to your server:

1. **SSH into your server:**
   ```bash
   ssh user@173.212.225.22
   ```

2. **Navigate to backend directory:**
   ```bash
   cd /path/to/your/backend/src/listing
   ```

3. **Edit the file:**
   ```bash
   nano listing.controller.ts
   # OR
   vi listing.controller.ts
   ```

4. **Add the cache invalidation code** (lines 123-130 from the file)

5. **Rebuild and restart:**
   ```bash
   cd /path/to/your/backend
   npm run build
   pm2 restart all  # Or your restart command
   ```

## ✅ Verify Deployment

After deploying, test the fix:

1. Go to admin panel: `http://localhost:8080/admin/listings`
2. Click "Managed by EX" button on a listing
3. Wait for success message
4. **Refresh the page** (F5 or Ctrl+R)
5. The "Managed by EX" status should **persist** after refresh

## 🔍 Check Server Logs

After deployment, check your server logs to see the cache invalidation messages:
```
🗑️ Cache invalidated for listing [id] and all listing queries
✅ Updated listing data includes managed_by_ex: true/false
```

## 📋 Quick Reference: Exact Code to Add

In `ex-buy-sell-apis/src/listing/listing.controller.ts`, in the `update` method, **replace** this:

```typescript
const data = await this.listingService.update(id, userId, body);
await this.cacheManager.del(`${this.constructor.name}`);
return data;
```

**With this:**

```typescript
const data = await this.listingService.update(id, userId, body);

// Invalidate all listing caches - both the specific listing and all findAll queries
await this.cacheManager.del(`${this.constructor.name}:${id}`);
// Note: Cache manager doesn't support pattern deletion, so we clear the base key
// This will force fresh fetches on next request
await this.cacheManager.del(`${this.constructor.name}`);

console.log(`🗑️ Cache invalidated for listing ${id} and all listing queries`);
console.log(`✅ Updated listing data includes managed_by_ex: ${data.managed_by_ex}`);

return data;
```

## ⚠️ Important Notes

- **Always backup** your server files before making changes
- **Test in development** first if possible
- The server needs to be **restarted** after code changes for them to take effect
- If using PM2, use `pm2 restart all` or `pm2 reload all`
- If using Docker, rebuild the container: `docker-compose up --build -d`

