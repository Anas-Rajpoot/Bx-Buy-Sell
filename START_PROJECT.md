# How to Run the Project - Step by Step

## 🚀 Quick Start (Easiest Method)

### Method 1: Using Docker (Recommended)

**Step 1: Start Backend with Docker**
```bash
cd ex-buy-sell-apis
docker-compose up
```

This starts:
- ✅ Backend API on `http://localhost:1230`
- ✅ Redis (caching)
- ✅ RabbitMQ (message queue)

**Step 2: Start Frontend**
```bash
# In a new terminal, go to project root
npm install
npm run dev
```

Frontend will be at: `http://localhost:5173`

---

### Method 2: Manual Setup (More Control)

**Step 1: Setup Backend**

```bash
cd ex-buy-sell-apis

# Install dependencies
npm install

# Create .env file (copy the template below)
# Then generate Prisma client
npx prisma generate

# Start backend
npm run start:dev
```

**Step 2: Setup Frontend**

```bash
# In project root
npm install

# Create .env file (copy the template below)
# Start frontend
npm run dev
```

---

## 📝 Environment Variables Setup

### Backend `.env` file
Create `ex-buy-sell-apis/.env`:

```env
DATABASE_URL=mongodb://localhost:27017/ex-buy-sell-db
PORT=1230
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-here
REDIS_HOST=localhost:6379
RABBIT_MQ=localhost:5672
```

**For MongoDB Atlas (Cloud):**
```env
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/ex-buy-sell-db
```

### Frontend `.env` file
Create `.env` in project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-key
VITE_API_BASE_URL=http://localhost:1230
```

---

## 🗄️ Database Setup

### MongoDB Options:

**Option A: MongoDB Atlas (Free Cloud)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create a cluster
4. Get connection string
5. Add to backend `.env`

**Option B: Local MongoDB**
1. Install MongoDB: https://www.mongodb.com/try/download/community
2. Start MongoDB service
3. Use: `mongodb://localhost:27017/ex-buy-sell-db`

### Supabase Setup:
1. Go to https://supabase.com
2. Create free project
3. Copy project URL and anon key
4. Add to frontend `.env`
5. Run migrations from `supabase/migrations/` folder

---

## ✅ Verify It's Working

### Check Backend:
```bash
# Open in browser or use curl
http://localhost:1230/api
# Should show Swagger API documentation
```

### Check Frontend:
```bash
# Open in browser
http://localhost:5173
# Should show the landing page
```

### Test API:
```bash
# Get categories
curl http://localhost:1230/category

# Should return JSON array
```

---

## 🐛 Common Issues

### Port Already in Use
```bash
# Change port in backend .env
PORT=3001

# Or kill process using port 1230
# Windows:
netstat -ano | findstr :1230
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:1230 | xargs kill
```

### MongoDB Connection Error
- Check if MongoDB is running
- Verify connection string
- For Atlas: Whitelist your IP address

### Frontend Can't Connect to Backend
- Check `VITE_API_BASE_URL` in frontend `.env`
- Verify backend is running on correct port
- Check browser console for CORS errors

---

## 📱 Access Points

Once running:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:1230
- **API Docs**: http://localhost:1230/api
- **RabbitMQ UI**: http://localhost:15672 (guest/guest)

---

## 🎯 Next Steps

1. ✅ Backend running on port 1230
2. ✅ Frontend running on port 5173
3. ✅ Create user account at `/register`
4. ✅ Login at `/login`
5. ✅ Create listing at `/dashboard`
6. ✅ View listings at `/`

---

## 💡 Pro Tips

- Use **Docker** for easiest setup
- Use **MongoDB Atlas** for cloud database (no local install)
- Check terminal output for errors
- Use browser DevTools (F12) to debug frontend
- Check `/api` endpoint for backend API documentation












