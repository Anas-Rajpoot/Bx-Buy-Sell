# WebSocket Chat Setup Guide

## Current Configuration

- **WebSocket Gateway Port**: 3002
- **HTTP API Port**: 1230
- **Gateway Class**: `ChatGateway` in `ex-buy-sell-apis/src/chat/chat.gateway.ts`

## Setup Steps

### 1. Docker Setup (if using Docker)

The `docker-compose.yml` has been updated to expose port 3002:

```yaml
ports:
  - "1230:1230"
  - "3002:3002"  # WebSocket gateway port
```

**Restart the backend:**
```powershell
cd ex-buy-sell-apis
docker-compose down
docker-compose up -d
```

### 2. Local Setup (if running locally)

If running the backend locally (not in Docker):

1. Ensure port 3002 is not blocked by firewall
2. Start the backend server:
   ```powershell
   cd ex-buy-sell-apis
   npm run start:dev
   ```

3. Check backend logs for:
   ```
   🚀 WebSocket Gateway initialized on port 3002
   ✅ ChatGateway is ready to accept connections
   ```

### 3. Frontend Connection

The frontend connects to: `http://173.212.225.22:3002` (or your API host + port 3002)

Check browser console for connection logs:
- `🔌 Connecting to Socket.IO server: http://...`
- `✅ Socket.IO connected successfully!`

### 4. Testing the Connection

1. Open browser DevTools (F12)
2. Go to Console tab
3. Open the chat page
4. Look for connection logs

**Expected logs:**
```
🔌 Connecting to Socket.IO server: http://173.212.225.22:3002
✅ Socket.IO connected successfully! ID: <socket-id>
📥 Joined room: <chat-id>
```

**If you see errors:**
- `Connection error: websocket error` - Backend WebSocket server not running or port 3002 not accessible
- `Connection timeout` - Firewall blocking port 3002
- `CORS error` - CORS configuration issue (should be `origin: '*'`)

### 5. Troubleshooting

**Backend not starting WebSocket gateway:**
- Check backend logs for initialization messages
- Verify `ChatModule` is imported in `AppModule`
- Verify `ChatGateway` is in `ChatModule` providers

**Port 3002 not accessible:**
- Check firewall settings
- Verify docker-compose port mapping
- Test with: `telnet 173.212.225.22 3002` (or your server IP)

**Connection works but messages don't send:**
- Check browser console for Socket.IO events
- Verify `join:room` event is emitted
- Check backend logs for message handling

## Backend Logs to Watch

When a client connects, you should see:
```
👤 New WebSocket client connected: <socket-id>
📥 Client <socket-id> joined room: <chat-id>
```

When a message is sent:
```
📤 Message received in room: <chat-id>
```

## Frontend Environment Variables

Optional: Set `VITE_WS_URL` in `.env`:
```
VITE_WS_URL=http://173.212.225.22:3002
```

If not set, it will derive from `VITE_API_BASE_URL` + port 3002.










