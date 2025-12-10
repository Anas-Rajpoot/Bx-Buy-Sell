# Socket.IO Setup - Backend and Frontend Configuration

## Summary
This document outlines the Socket.IO setup for real-time chat functionality between the frontend and backend.

## Backend Changes

### 1. Updated `ex-buy-sell-apis/src/chat/chat.gateway.ts`
- Enhanced WebSocket gateway configuration with proper CORS settings
- Added support for both websocket and polling transports
- Configured allowed headers for authentication

**Changes:**
```typescript
@WebSocketGateway({ 
  cors: { 
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Authorization', 'Content-Type']
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true
})
```

### 2. Updated `ex-buy-sell-apis/src/main.ts`
- Changed default port from 3000 to 1230 to match frontend expectations
- Added console logs for better debugging

**Changes:**
```typescript
const port = process.env.PORT ?? 1230;
await app.listen(port);
console.log(`🚀 Application is running on: http://localhost:${port}`);
console.log(`📡 WebSocket Gateway is available at: ws://localhost:${port}`);
```

## Frontend Changes

### 1. Created `src/lib/socket.ts`
- Centralized Socket.IO connection service
- Consistent configuration across all components
- Proper error handling and logging

**Features:**
- Automatic reconnection with exponential backoff
- Support for authentication tokens
- Environment variable support for URL configuration

### 2. Updated `src/components/chat/ChatWindow.tsx`
- Replaced direct `io()` calls with centralized `createSocketConnection()`
- Improved connection reliability

### 3. Updated `src/components/admin/chat/AdminChatWindow.tsx`
- Replaced direct `io()` calls with centralized `createSocketConnection()`
- Consistent connection handling

## Dependencies

### Backend (`ex-buy-sell-apis/package.json`)
- ✅ `socket.io`: ^4.8.1
- ✅ `@nestjs/platform-socket.io`: ^11.1.4
- ✅ `@nestjs/websockets`: ^11.1.4
- ✅ `@socket.io/redis-adapter`: ^8.3.0 (for Redis scaling - optional)

### Frontend (`package.json`)
- ✅ `socket.io-client`: ^4.8.1

## Environment Variables

### Backend (`.env`)
```env
PORT=1230
# Other backend environment variables...
```

### Frontend (`.env`)
```env
VITE_API_BASE_URL=http://173.212.225.22:1230
VITE_WS_URL=http://173.212.225.22:1230
# Or use the same URL for both
```

## Socket.IO Events

### Client → Server Events
- `join:room` - Join a chat room
- `leave:room` - Leave a chat room
- `send:message` - Send a message
- `message:send:admin` - Send admin message
- `offer:user` - Send offer
- `offer:user:response` - Respond to offer
- `join:room:admin` - Admin joins room
- `video:register` - Register for video call
- `video:call-user` - Call a user
- `video:accept-call` - Accept video call
- `video:end-call` - End video call
- `video:media-status` - Update media status
- `video:disconnect` - Disconnect from video

### Server → Client Events
- `connect` - Connection established
- `disconnect` - Connection lost
- `message` - Receive message
- `message:recieve` - Broadcast message
- `join:admin` - Admin joined notification
- `video:incoming-call` - Incoming video call
- `video:call-accepted` - Video call accepted
- `video:call-ended` - Video call ended

## Testing

1. **Start Backend:**
   ```bash
   cd ex-buy-sell-apis
   npm run start:dev
   ```

2. **Start Frontend:**
   ```bash
   npm run dev
   ```

3. **Check Console:**
   - Backend should show: `✅ ChatGateway is ready to accept connections`
   - Frontend should show: `✅ Socket.IO connected successfully! ID: <socket-id>`

## Troubleshooting

### Connection Errors
1. **Check Backend is Running:**
   - Verify backend is listening on port 1230
   - Check console for WebSocket gateway initialization

2. **Check CORS:**
   - Backend CORS is set to `origin: '*'` - should allow all origins
   - If issues persist, check browser console for CORS errors

3. **Check URL:**
   - Ensure `VITE_API_BASE_URL` matches backend URL
   - WebSocket URL should be the same as HTTP API URL

4. **Check Network:**
   - Verify firewall allows WebSocket connections
   - Check if proxy is interfering with WebSocket upgrade

### Common Issues
- **"Connection error: websocket error"**: Backend not running or wrong URL
- **"CORS error"**: Check backend CORS configuration
- **"Timeout"**: Network issues or backend not responding

## Deployment Notes

When deploying to production:
1. Update `VITE_API_BASE_URL` to production backend URL
2. Ensure backend `PORT` environment variable is set correctly
3. Configure firewall to allow WebSocket connections
4. If using load balancer, ensure it supports WebSocket upgrades

