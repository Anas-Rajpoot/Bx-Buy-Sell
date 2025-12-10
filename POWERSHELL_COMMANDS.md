# PowerShell Commands for Project Management

## 🚀 Quick Start Commands

### Option 1: Use the Restart Script (Recommended)
```powershell
.\restart-project.ps1
```
This will:
- Start backend server in a new PowerShell window
- Start frontend server in a new PowerShell window
- Both servers will run in separate windows

### Option 2: Manual Start (Separate Terminals)

**Terminal 1 - Backend:**
```powershell
cd ex-buy-sell-apis
npm run start:dev
```

**Terminal 2 - Frontend:**
```powershell
npm run dev
```

### Option 3: Use Individual Scripts

**Start Backend Only:**
```powershell
.\start-backend.ps1
```

**Start Frontend Only:**
```powershell
.\start-frontend.ps1
```

## 📍 Server URLs

- **Backend API**: http://localhost:1230
- **Frontend**: http://localhost:5173
- **API Documentation**: http://localhost:1230/api

## 🛑 Stop Servers

To stop the servers:
1. Go to each PowerShell window
2. Press `Ctrl + C` to stop the server
3. Or close the PowerShell window

## 🔄 Restart Servers

1. Stop all running servers (Ctrl+C in each window)
2. Run `.\restart-project.ps1` again
3. Or manually start each server in separate terminals

## ⚠️ Troubleshooting

### If scripts don't run:
```powershell
# Allow script execution (run as Administrator)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Check if servers are running:
```powershell
# Check Node.js processes
Get-Process | Where-Object {$_.ProcessName -eq "node"}
```

### Kill all Node.js processes:
```powershell
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force
```

## 📝 Notes

- Backend runs on port **1230**
- Frontend runs on port **5173** (or next available port)
- Both servers auto-reload on file changes
- Backend requires MongoDB connection
- Frontend requires backend to be running for API calls










