import { Body, Controller, Get, Param, Put, Query, Delete, Post } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatLabelType } from '@prisma/client';
import { ZodValidationPipe } from 'common/validator/zod.validator';
import { UpdateLabelDTO, updateLabelSchema } from './dto/update-label';
import { ApiBody, ApiParam } from '@nestjs/swagger';
import { Roles } from 'common/decorator/roles.decorator';
@Roles(['ADMIN', 'MONITER']) // Default: Only admin/moniter, but individual endpoints override this
@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}
  //  Chat Specific
  @Roles(['ADMIN', 'MONITER', 'USER']) // CRITICAL: Allow USER role to fetch their own chats
  @Get('/fetch/user/:userId')
  @ApiParam({ name: 'userId', description: 'User ID', type: String })
  getChatRoomsByUserId(@Param('userId') userId: string) {
    return this.chatService.getChatRoomsByUserId(userId);
  }

  @Roles(['ADMIN', 'MONITER', 'USER']) // CRITICAL: Allow USER role to fetch chats where they are seller
  @Get('/fetch/seller/:sellerId')
  @ApiParam({ name: 'sellerId', description: 'Seller ID', type: String })
  getChatRoomsBySellerId(@Param('sellerId') sellerId: string) {
    return this.chatService.getChatRoomsBySellerId(sellerId);
  }
  @Roles(['ADMIN', 'MONITER', 'USER', 'STAFF'])
  @Get('/fetch/:userId/:sellerId')
  @ApiParam({ name: 'userId', description: 'User ID', type: String })
  @ApiParam({ name: 'sellerId', description: 'Seller ID', type: String })
  fetchChatRoom(
    @Param('userId') userId: string,
    @Param('sellerId') sellerId: string,
    @Query('listingId') listingId?: string, // CRITICAL: Optional listingId to scope chat to specific listing
  ) {
    return this.chatService.getChatRoom(userId, sellerId, listingId);
  }

  @Roles(['ADMIN', 'MONITER', 'USER', 'STAFF'])
  @Get('/create/:userId/:sellerId')
  @ApiParam({ name: 'userId', description: 'User ID', type: String })
  @ApiParam({ name: 'sellerId', description: 'Seller ID', type: String })
  createChatRoom(
    @Param('userId') userId: string,
    @Param('sellerId') sellerId: string,
    @Query('listingId') listingId?: string, // CRITICAL: Optional listingId to create listing-specific chat
  ) {
    return this.chatService.createChatRoom(userId, sellerId, listingId);
  }

  @Get('/get-chat-count/:userId')
  @ApiParam({ name: 'userId', description: 'Admin/Moniter ID', type: String })
  get(
    @Param('userId') userId: string,
  ) {
    return this.chatService.getMangaedChatRoomsCountById(userId);
  }

  // Get all chats for admin
  @Get('/all')
  @Roles(['ADMIN', 'MONITER', 'STAFF'])
  getAllChats() {
    return this.chatService.getAllChats();
  }

  @Roles(['ADMIN', 'MONITER', 'USER', 'STAFF'])
  @Put('/update/label')
  @ApiBody({ type: () => UpdateLabelDTO })
  updateChatLabelStatus(@Body(new ZodValidationPipe(updateLabelSchema)) body) {
    const { userId, chatId, label } = body;
    return this.chatService.updateChatLabelStatus(
      chatId,
      userId,
      label as ChatLabelType,
    );
  }

  // Delete chat (must be before /:id route to avoid conflicts)
  @Roles(['ADMIN', 'MONITER', 'USER', 'STAFF'])
  @Delete('/delete/:chatId/:userId')
  @ApiParam({ name: 'chatId', description: 'Chat ID', type: String })
  @ApiParam({ name: 'userId', description: 'User ID', type: String })
  async deleteChat(
    @Param('chatId') chatId: string,
    @Param('userId') userId: string,
  ) {
    return this.chatService.deleteChat(chatId, userId);
  }

  // Archive chat
  @Roles(['ADMIN', 'MONITER', 'USER', 'STAFF'])
  @Put('/archive/:chatId/:userId')
  @ApiParam({ name: 'chatId', description: 'Chat ID', type: String })
  @ApiParam({ name: 'userId', description: 'User ID', type: String })
  async archiveChat(
    @Param('chatId') chatId: string,
    @Param('userId') userId: string,
  ) {
    return this.chatService.archiveChat(chatId, userId);
  }

  // Unarchive chat
  @Roles(['ADMIN', 'MONITER', 'USER', 'STAFF'])
  @Put('/unarchive/:chatId/:userId')
  @ApiParam({ name: 'chatId', description: 'Chat ID', type: String })
  @ApiParam({ name: 'userId', description: 'User ID', type: String })
  async unarchiveChat(
    @Param('chatId') chatId: string,
    @Param('userId') userId: string,
  ) {
    return this.chatService.unarchiveChat(chatId, userId);
  }

  // Block user
  @Roles(['ADMIN', 'MONITER', 'USER', 'STAFF'])
  @Post('/block/:blockerId/:blockedUserId')
  @ApiParam({ name: 'blockerId', description: 'User ID who is blocking', type: String })
  @ApiParam({ name: 'blockedUserId', description: 'User ID being blocked', type: String })
  async blockUser(
    @Param('blockerId') blockerId: string,
    @Param('blockedUserId') blockedUserId: string,
  ) {
    return this.chatService.blockUser(blockerId, blockedUserId);
  }

  // Unblock user
  @Roles(['ADMIN', 'MONITER', 'USER', 'STAFF'])
  @Post('/unblock/:blockerId/:blockedUserId')
  @ApiParam({ name: 'blockerId', description: 'User ID who is unblocking', type: String })
  @ApiParam({ name: 'blockedUserId', description: 'User ID being unblocked', type: String })
  async unblockUser(
    @Param('blockerId') blockerId: string,
    @Param('blockedUserId') blockedUserId: string,
  ) {
    return this.chatService.unblockUser(blockerId, blockedUserId);
  }

  // Mark messages as read
  @Roles(['ADMIN', 'MONITER', 'USER', 'STAFF'])
  @Put('/mark-read/:chatId/:userId')
  @ApiParam({ name: 'chatId', description: 'Chat ID', type: String })
  @ApiParam({ name: 'userId', description: 'User ID', type: String })
  async markMessagesAsRead(
    @Param('chatId') chatId: string,
    @Param('userId') userId: string,
  ) {
    return this.chatService.markMessagesAsRead(chatId, userId);
  }

  // -------------------Video Call Specific------------------
  @Roles(['ADMIN', 'MONITER', 'USER', 'STAFF'])
  @Get('/agora/token') 
  
  getAgoraToken(@Query('channelName') channelName : string, @Query('uid') uid : string) {
    
    return this.chatService.getAgoraToken(channelName, uid);
  }

  // Get chat by ID with full details (must be last to avoid route conflicts)
  @Get('/:id')
  @Roles(['ADMIN', 'MONITER', 'STAFF', 'USER'])
  @ApiParam({ name: 'id', description: 'Chat ID', type: String })
  getChatById(@Param('id') id: string) {
    return this.chatService.getChatById(id);
  }
}
