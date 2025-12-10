import {
  SubscribeMessage,
  WebSocketGateway,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  WebSocketServer,
  WsException,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { MessageQueueService } from 'src/message-queue/message-queue.service';
import { RedisAdapterService } from 'src/redis-adapter/redis-adapter.service';
import { ChatService } from './chat.service';
import { z } from 'zod';
import parsePhoneNumberFromString from 'libphonenumber-js';

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
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  io: Server;

  // Track active connections and their rooms
  private activeConnections = new Map<string, Set<string>>();

  constructor(
    private readonly redisAdapterService: RedisAdapterService,
    private readonly messageQueueService: MessageQueueService,
    private readonly chatService: ChatService,
  ) {}

  async afterInit(server: Server) {
    this.io = server;
    console.log('🚀 WebSocket Gateway initialized');
    try {
      await this.redisAdapterService.connectToRedis();
      console.log('✅ Redis adapter connected');
    } catch (error) {
      console.error('❌ Failed to connect Redis adapter:', error);
    }
  }

  handleConnection(client: Socket) {
    // Extract token from handshake auth
    const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.replace('Bearer ', '');
    
    console.log('👤 Client connecting:', {
      clientId: client.id,
      hasToken: !!token,
      auth: client.handshake.auth,
      headers: Object.keys(client.handshake.headers)
    });
    
    // Note: Authentication can be added here if needed
    // For now, we allow connection but validate on message send
    
    this.activeConnections.set(client.id, new Set());
    console.log('✅ Client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('👋 Client disconnected:', client.id);
    this.activeConnections.delete(client.id);
  }

  // Join Room - CRITICAL: Only allow joining ONE room at a time
  @SubscribeMessage('join:room')
  handleJoinRoom(
    @MessageBody() { chatId }: { chatId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      if (!chatId) {
        throw new WsException('chatId is required');
      }

      // CRITICAL: Leave all other rooms first to ensure isolation
      const currentRooms = this.activeConnections.get(client.id) || new Set();
      currentRooms.forEach(room => {
        if (room !== client.id) { // Don't leave the default socket.io room
          client.leave(room);
          console.log('📤 Client', client.id, 'left room:', room);
        }
      });

      // Join the new room
      client.join(chatId);
      this.activeConnections.set(client.id, new Set([chatId]));
      
      // Verify room membership immediately
      const roomClients = this.io.sockets.adapter.rooms.get(chatId);
      const clientCount = roomClients?.size || 0;
      
      console.log('✅ Client', client.id, 'joined room:', chatId);
      console.log('📊 Room', chatId, 'now has', clientCount, 'client(s)');
      
      // Send confirmation to client
      client.emit('room:joined', { 
        chatId, 
        success: true,
        clientCount 
      });
      
      return { success: true, chatId, clientCount };
    } catch (error) {
      console.error('❌ Error joining room:', error);
      client.emit('error', { 
        message: error instanceof Error ? error.message : 'Failed to join room' 
      });
      throw new WsException('Failed to join room');
    }
  }

  // Leave Room
  @SubscribeMessage('leave:room')
  handleLeaveRoom(
    @MessageBody() { chatId }: { chatId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      if (chatId === 'all') {
        // Leave all rooms except the default socket.io room
        const rooms = this.activeConnections.get(client.id) || new Set();
        rooms.forEach(room => {
          if (room !== client.id) {
            client.leave(room);
            console.log('📤 Client', client.id, 'left room:', room);
          }
        });
        this.activeConnections.set(client.id, new Set());
        console.log('📤 Client', client.id, 'left all chat rooms');
      } else if (chatId) {
        client.leave(chatId);
        const rooms = this.activeConnections.get(client.id) || new Set();
        rooms.delete(chatId);
        this.activeConnections.set(client.id, rooms);
        console.log('📤 Client', client.id, 'left room:', chatId);
      }
    } catch (error) {
      console.error('❌ Error leaving room:', error);
      throw new WsException('Failed to leave room');
    }
  }

  // Send Message - CRITICAL: Only broadcast to the specific room
  @SubscribeMessage('send:message')
  async handleSendMessage(
    @MessageBody() message: any,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      // Validate message
      if (!message.chatId || !message.senderId || !message.content) {
        console.error('❌ Invalid message format:', message);
        throw new WsException('Invalid message format: chatId, senderId, and content are required');
      }

      console.log('📨 send_message called with:', {
        chatId: message.chatId,
        senderId: message.senderId,
        content: message.content?.substring(0, 50),
        clientId: client.id,
        messageId: message.id || 'no-id-yet'
      });

      // Validate content (prevent emails/phone numbers)
      const schema = z.string().email();
      const isValid = (message.content as string).split(' ').findIndex((el) => {
        if (
          schema.safeParse(el).success ||
          parsePhoneNumberFromString(el)?.isValid()
        ) {
          return true;
        }
      });

      if (isValid !== -1) {
        message.type = 'ERROR';
        message.content = "Don't use email or phone number";
        this.io.to(message.chatId).emit('message', JSON.stringify(message));
        return;
      }

      // Save message to database FIRST
      let savedMessage;
      try {
        savedMessage = await this.chatService.createMessage({
          chatId: message.chatId,
          senderId: message.senderId,
          content: message.content,
          type: message.type || 'TEXT',
          fileUrl: message.fileUrl || null,
        });
        
        message.id = savedMessage.id;
        message.createdAt = savedMessage.createdAt.toISOString();
        message.read = savedMessage.read;
        message.fileUrl = savedMessage.fileUrl || message.fileUrl; // Preserve fileUrl from saved message
        
        console.log('✅ Message saved to database, id:', savedMessage.id, {
          messageId: savedMessage.id,
          chatId: message.chatId,
          senderId: message.senderId
        });
      } catch (dbError) {
        console.error('❌ Error saving message to database:', dbError);
        throw new WsException('Failed to save message to database');
      }

      // CRITICAL: Get clients in the SPECIFIC room only
      const roomClients = await this.io.in(message.chatId).fetchSockets();
      
      console.log('📤 Broadcasting to room:', {
        chatId: message.chatId,
        clientsCount: roomClients.length,
        messageId: message.id,
        clientIds: roomClients.map(c => c.id)
      });
      
      if (roomClients.length === 0) {
        console.warn('⚠️ WARNING: No clients in room! Message saved but not delivered:', {
          chatId: message.chatId,
          messageId: message.id,
          message: 'The message was saved to the database but no clients are currently in this room. They will see it when they join or refresh.'
        });
      } else {
        // Verify sender is in the room
        const senderInRoom = roomClients.some(c => c.id === client.id);
        if (!senderInRoom) {
          console.warn('⚠️ WARNING: Sender not in room!', {
            chatId: message.chatId,
            senderSocketId: client.id,
            roomClients: roomClients.map(c => c.id)
          });
        }
      }

      // CRITICAL: Broadcast ONLY to the specific room
      const messageString = JSON.stringify(message);
      
      // Emit to all clients in the room (including sender) - ONLY emit 'message' event ONCE
      // The sender is already in the room, so they'll receive it via room broadcast
      // Only emit ONE event type to prevent duplicates on frontend
      console.log('📤 Broadcasting message to room:', message.chatId, 'messageId:', message.id);
      this.io.to(message.chatId).emit('message', messageString);
      
      // Queue for additional processing
      this.messageQueueService.queueMessage(message);
      
      console.log('✅ Message broadcasted successfully to', roomClients.length, 'client(s)');
    } catch (error) {
      console.error('❌ Error in handleSendMessage:', error);
      throw new WsException(error instanceof Error ? error.message : 'Failed to send message');
    }
  }

  // Admin-specific handlers
  @SubscribeMessage('join:room:admin')
  handleJoinRoomAsAdmin(
    @MessageBody() { chatId }: { chatId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      client.join(chatId);
      this.io.to(chatId).emit('join:admin', JSON.stringify({
        adminJoined: true,
        message: 'An Admin Has Joined the Chat..',
      }));
      console.log('👮 Admin joined room:', chatId);
    } catch (error) {
      throw new WsException('Failed to join as admin');
    }
  }

  @SubscribeMessage('message:send:admin')
  handleSendAdminMessage(
    @MessageBody() message: any,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      message.type = 'ADMIN';
      this.messageQueueService.queueMessage(message);
      this.io.to(message.chatId).emit('message', JSON.stringify(message));
      this.io.to(message.chatId).emit('message:recieve', JSON.stringify(message));
    } catch (error) {
      throw new WsException('Failed to send admin message');
    }
  }

  // Offer handlers
  @SubscribeMessage('offer:user')
  async handleOfferUser(
    @MessageBody() message: any,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      message.type = 'OFFER';
      await this.chatService.updateOfferStatus(message.chatId, true);
      this.messageQueueService.queueMessage(message);
      this.io.to(message.chatId).emit('message', JSON.stringify(message));
      this.io.to(message.chatId).emit('message:recieve', JSON.stringify(message));
    } catch (error) {
      throw new WsException('Failed to process offer');
    }
  }

  @SubscribeMessage('offer:user:response')
  async handleOfferUserResponse(
    @MessageBody() message: any,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      message.type = 'OFFER';
      const response = message.response === 'true' ? true : false;
      await this.chatService.updateOfferStatus(message.chatId, response);
      this.messageQueueService.queueMessage(message);
      this.io.to(message.chatId).emit('message', JSON.stringify(message));
      this.io.to(message.chatId).emit('message:recieve', JSON.stringify(message));
    } catch (error) {
      throw new WsException('Failed to process offer response');
    }
  }

  // Video call handlers
  @SubscribeMessage('video:register')
  handleRegisterUserForVideoCall(
    @MessageBody() message: any,
    @ConnectedSocket() client: Socket,
  ) {
    this.redisAdapterService.getPubClient().set(message.uid, message.uid);
    console.log('📹 User registered for video call:', message.uid);
  }

  @SubscribeMessage('video:call-user')
  async handleCallUserForVideoCall(
    @MessageBody() message: any,
    @ConnectedSocket() client: Socket,
  ) {
    const targetSocket = await this.redisAdapterService
      .getPubClient()
      .get(message.to);
    if (targetSocket) {
      client.to(targetSocket).emit('video:incoming-call', {
        from: message.from,
        channelName: message.channelName,
      });
    }
  }

  @SubscribeMessage('video:accept-call')
  async handleAcceptCallForVideoCall(
    @MessageBody() message: any,
    @ConnectedSocket() client: Socket,
  ) {
    const targetSocket = await this.redisAdapterService
      .getPubClient()
      .get(message.from);
    if (targetSocket) {
      client.to(targetSocket).emit('video:call-accepted', message);
    }
  }

  @SubscribeMessage('video:end-call')
  async handleEndCallForVideoCall(
    @MessageBody() message: any,
    @ConnectedSocket() client: Socket,
  ) {
    const targetSocket = await this.redisAdapterService
      .getPubClient()
      .get(message.to);
    if (targetSocket) {
      client.to(targetSocket).emit('video:call-ended', { from: message.from });
    }
  }

  @SubscribeMessage('video:media-status')
  async handleMediaStatusForVideoCall(
    @MessageBody() message: any,
    @ConnectedSocket() client: Socket,
  ) {
    const targetSocket = await this.redisAdapterService
      .getPubClient()
      .get(message.to);
    if (targetSocket) {
      client.to(targetSocket).emit('video:call-ended', {
        from: message.from,
        mic: message.mic,
        camera: message.camera
      });
    }
  }

  @SubscribeMessage('video:disconnect')
  async handleDisconnectForVideoCall(
    @MessageBody() message: any,
    @ConnectedSocket() client: Socket,
  ) {
    await this.redisAdapterService.getPubClient().del(message.uid);
  }
}
