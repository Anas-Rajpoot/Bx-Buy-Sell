import { HttpException, Injectable } from '@nestjs/common';
import { ChatLabelType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { RtcRole, RtcTokenBuilder } from 'agora-access-token';
import { RedisAdapterService } from 'src/redis-adapter/redis-adapter.service';

@Injectable()
export class ChatService {
  constructor(
    private db: PrismaService,
    private redis: RedisAdapterService,
  ) {}

  async getChatRoom(userId: string, sellerId: string, listingId?: string) {
    // CRITICAL: Find ALL chat rooms between these users and merge their messages
    const whereConditions = [
      {
        AND: [
          { userId: userId },
          { sellerId: sellerId },
        ],
      },
      {
        AND: [
          { userId: sellerId },
          { sellerId: userId },
        ],
      }
    ];
    
    // Get ALL chat rooms between these users
    const allChatRooms = await this.db.chat.findMany({
      where: {
        OR: whereConditions,
      },
      include: {
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            profile_pic: true,
          },
        },
        seller: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            profile_pic: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
          include: {
            sender: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
                profile_pic: true,
              },
            },
          },
        },
        listing: {
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    if (allChatRooms.length === 0) {
      return null;
    }

    // Get the most recent chat room as the primary one
    const primaryChatRoom = allChatRooms[0];
    
    // Merge ALL messages from ALL chat rooms
    const allMessages = allChatRooms.flatMap(room => 
      room.messages.map(msg => ({
        ...msg,
        chatId: room.id, // Keep original chatId for reference
      }))
    );

    // Sort all messages by creation date
    allMessages.sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    // Return the primary chat room with ALL merged messages
    const mergedChatRoom = {
      ...primaryChatRoom,
      messages: allMessages,
      // Update updatedAt to the most recent message time
      updatedAt: allMessages.length > 0 
        ? new Date(allMessages[allMessages.length - 1].createdAt)
        : primaryChatRoom.updatedAt,
    };
    
    const chatRoom = mergedChatRoom;
    
    console.log('🔍 getChatRoom:', {
      userId,
      sellerId,
      listingId: listingId || 'none',
      found: !!chatRoom,
      chatRoomId: chatRoom?.id,
      chatRoomListingId: chatRoom?.listingId,
      messagesCount: chatRoom?.messages?.length || 0
    });
    
    return chatRoom;
  }

  async getChatRoomsBySellerId(sellerId: string) {
    return await this.db.chat.findMany({
      where: {
        sellerId: sellerId,
      },
    });
  }

  async getChatRoomsByUserId(userId: string) {
    return await this.db.chat.findMany({
      where: {
        userId: userId,
      },
    });
  }

  async createMessage(data: {
    chatId: string;
    senderId: string;
    content: string;
    type?: string;
    fileUrl?: string;
  }) {
    // Create message and update chat room's updatedAt in a transaction
    const message = await this.db.message.create({
      data: {
        chatId: data.chatId,
        senderId: data.senderId,
        content: data.content,
        type: (data.type as any) || 'TEXT',
        fileUrl: data.fileUrl || null,
      },
    });

    // Update chat room's updatedAt timestamp
    await this.db.chat.update({
      where: { id: data.chatId },
      data: { updatedAt: new Date() },
    });

    return message;
  }

  // Get all chats for admin
  async getAllChats() {
    return await this.db.chat.findMany({
      include: {
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            profile_pic: true,
          },
        },
        seller: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            profile_pic: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
          select: {
            id: true,
            content: true,
            createdAt: true,
            senderId: true,
            read: true,
          },
        },
        chatLabel: {
          select: {
            label: true,
            userId: true,
          },
        },
        monitorViews: {
          select: {
            monitorId: true,
            viewedAt: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  // Get chat by ID with full details
  async getChatById(chatId: string) {
    return await this.db.chat.findUnique({
      where: {
        id: chatId,
      },
      include: {
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            profile_pic: true,
          },
        },
        seller: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            profile_pic: true,
          },
        },
        listing: {
          select: {
            id: true,
            status: true,
            portfolioLink: true,
            created_at: true,
            updated_at: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
          include: {
            sender: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
                profile_pic: true,
              },
            },
          },
        },
        chatLabel: {
          select: {
            label: true,
            userId: true,
          },
        },
        monitorViews: {
          select: {
            monitorId: true,
            viewedAt: true,
          },
        },
      },
    });
  }

  async getMangaedChatRoomsCountById(userId: string) {
    const count = await this.db.chatMonitor.count({
      where: {
        monitorId: userId,
      },
    });

    return {
      id: userId,
      count: count,
    };
  }

  async createChatRoom(userId: string, sellerId: string, listingId?: string) {
    // CRITICAL: Check if chat room exists first
    const existingRoom = await this.getChatRoom(userId, sellerId, listingId);
    
    console.log('🔍 Checking for existing chat room:', {
      userId,
      sellerId,
      listingId: listingId || 'none',
      found: !!existingRoom,
      existingRoomId: existingRoom?.id,
      existingRoomListingId: existingRoom?.listingId
    });
    
    if (existingRoom) {
      // If listingId provided and existing room doesn't have it, update it
      if (listingId && !existingRoom.listingId) {
        console.log('🔄 Updating existing chat room with listingId:', listingId);
        const updatedRoom = await this.db.chat.update({
          where: { id: existingRoom.id },
          data: { listingId: listingId },
          include: {
            user: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
                profile_pic: true,
              },
            },
            seller: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
                profile_pic: true,
              },
            },
            listing: {
              select: {
                id: true,
                status: true,
              },
            },
          },
        });
        console.log('✅ Updated existing chat room with listingId:', updatedRoom.id);
        return updatedRoom;
      }
      
      console.log('✅ Chat room already exists, returning existing room:', existingRoom.id);
      return existingRoom;
    }

    // CRITICAL: Create new chat room with listingId if provided
    // This ensures each listing gets its own unique chat room
    console.log('🆕 Creating new chat room:', { 
      userId, 
      sellerId, 
      listingId: listingId || 'none (general chat)' 
    });
    
    const newChatRoom = await this.db.chat.create({
      data: {
        userId: userId,
        sellerId: sellerId,
        listingId: listingId || null, // Store listingId if provided
      },
      include: {
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            profile_pic: true,
          },
        },
        seller: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            profile_pic: true,
          },
        },
        listing: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });
    
    console.log('✅ Created new chat room:', {
      id: newChatRoom.id,
      userId: newChatRoom.userId,
      sellerId: newChatRoom.sellerId,
      listingId: newChatRoom.listingId
    });
    
    return newChatRoom;
  }

  async updateOfferStatus(chatId: string, isOffered: boolean) {
    return await this.db.chat.update({
      where: {
        id: chatId,
      },
      data: {
        isOffered: isOffered,
      },
    });
  }

  async updateChatLabelStatus(
    chatId: string,
    userId: string,
    label: ChatLabelType,
  ) {
    return await this.db.chatLabel.upsert({
      where: {
        chatId: chatId,
        userId: userId,
      },
      create: {
        chatId: chatId,
        userId: userId,
        label: label,
      },
      update: {
        label: label,
      },
    });
  }

  async deleteChat(chatId: string, userId: string) {
    // Verify user is part of this chat before deleting
    const chat = await this.db.chat.findUnique({
      where: { id: chatId },
    });

    if (!chat) {
      throw new HttpException('Chat not found', 404);
    }

    if (chat.userId !== userId && chat.sellerId !== userId) {
      throw new HttpException('Unauthorized to delete this chat', 403);
    }

    // Delete all messages first
    await this.db.message.deleteMany({
      where: { chatId: chatId },
    });

    // Delete chat labels
    await this.db.chatLabel.deleteMany({
      where: { chatId: chatId },
    });

    // Delete chat monitors
    await this.db.chatMonitor.deleteMany({
      where: { chatId: chatId },
    });

    // Delete the chat room
    return await this.db.chat.delete({
      where: { id: chatId },
    });
  }

  async archiveChat(chatId: string, userId: string) {
    // Verify user is part of this chat
    const chat = await this.db.chat.findUnique({
      where: { id: chatId },
    });

    if (!chat) {
      throw new HttpException('Chat not found', 404);
    }

    if (chat.userId !== userId && chat.sellerId !== userId) {
      throw new HttpException('Unauthorized to archive this chat', 403);
    }

    return await this.db.chat.update({
      where: { id: chatId },
      data: { status: 'ARCHIVED' },
    });
  }

  async unarchiveChat(chatId: string, userId: string) {
    // Verify user is part of this chat
    const chat = await this.db.chat.findUnique({
      where: { id: chatId },
    });

    if (!chat) {
      throw new HttpException('Chat not found', 404);
    }

    if (chat.userId !== userId && chat.sellerId !== userId) {
      throw new HttpException('Unauthorized to unarchive this chat', 403);
    }

    return await this.db.chat.update({
      where: { id: chatId },
      data: { status: 'ACTIVE' },
    });
  }

  async blockUser(blockerId: string, blockedUserId: string) {
    // For now, we'll use a simple approach: mark the chat as FLAGGED
    // In a production system, you'd want a separate UserBlock model
    // Find all chats between these users
    const chats = await this.db.chat.findMany({
      where: {
        OR: [
          { userId: blockerId, sellerId: blockedUserId },
          { userId: blockedUserId, sellerId: blockerId },
        ],
      },
    });

    // Mark all chats as FLAGGED (blocked)
    const updates = chats.map(chat =>
      this.db.chat.update({
        where: { id: chat.id },
        data: { status: 'FLAGGED' },
      })
    );

    await Promise.all(updates);
    return { success: true, message: 'User blocked successfully' };
  }

  async unblockUser(blockerId: string, blockedUserId: string) {
    // Find all chats between these users
    const chats = await this.db.chat.findMany({
      where: {
        OR: [
          { userId: blockerId, sellerId: blockedUserId },
          { userId: blockedUserId, sellerId: blockerId },
        ],
        status: 'FLAGGED',
      },
    });

    // Mark all chats as ACTIVE (unblocked)
    const updates = chats.map(chat =>
      this.db.chat.update({
        where: { id: chat.id },
        data: { status: 'ACTIVE' },
      })
    );

    await Promise.all(updates);
    return { success: true, message: 'User unblocked successfully' };
  }

  // -----------------------Video Call Specific---------------
  // Mark messages as read for a chat - marks across ALL chats with the same seller
  async markMessagesAsRead(chatId: string, userId: string) {
    // Verify user is part of this chat
    const chat = await this.db.chat.findUnique({
      where: { id: chatId },
    });

    if (!chat) {
      throw new HttpException('Chat not found', 404);
    }

    if (chat.userId !== userId && chat.sellerId !== userId) {
      throw new HttpException('Unauthorized to mark messages as read', 403);
    }

    // Get ALL chat rooms between these users
    const whereConditions = [
      {
        AND: [
          { userId: chat.userId },
          { sellerId: chat.sellerId },
        ],
      },
      {
        AND: [
          { userId: chat.sellerId },
          { sellerId: chat.userId },
        ],
      }
    ];

    const allChatRooms = await this.db.chat.findMany({
      where: {
        OR: whereConditions,
      },
      select: {
        id: true,
      },
    });

    // Get all chat IDs
    const allChatIds = allChatRooms.map(room => room.id);

    // Mark all unread messages from other users as read across ALL chats with this seller
    const updateResult = await this.db.message.updateMany({
      where: {
        chatId: { in: allChatIds }, // All chats with this seller
        senderId: { not: userId }, // Messages not from current user
        read: false, // Only update unread messages
      },
      data: {
        read: true,
      },
    });

    console.log(`✅ Marked ${updateResult.count} messages as read across ${allChatIds.length} chat(s) for user ${userId}`);

    return { success: true, message: 'Messages marked as read across all chats with this seller' };
  }

  async getAgoraToken(channelName: string, uid: string) {
    const appID = process.env.AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;

    if (!channelName || !uid) {
      throw new HttpException('Missing channelName or uid', 400);
    }

    if (!appID || !appCertificate) {
      throw new HttpException('Missing Agora App ID or App Certificate', 400);
    }
    const getUID = await this.redis.getPubClient().get(uid);
    if (!getUID) {
      await this.redis.getPubClient().set(uid, uid);
    }
    const expirationTimeInSeconds = 3600;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    const token = RtcTokenBuilder.buildTokenWithUid(
      appID,
      appCertificate,
      channelName,
      parseInt(uid),
      RtcRole.PUBLISHER,
      privilegeExpiredTs,
    );

    return { token };
  }
}
