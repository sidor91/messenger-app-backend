import { forwardRef, Inject, Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { ChatService } from '../chat/chat.service';
import { SendMessageDto } from '../chat/dto/send-message.dto';
import { JwtTokenService } from '../jwt-token/jwt-token.service';
import { User } from '../user/entity/user.entity';

@WebSocketGateway({
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Authorization'],
    credentials: true,
  },
})
export class WebsocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  logger: Logger;
  private userSocketMap: Map<string, Socket> = new Map();

  constructor(
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService,
    private readonly jwtTokenService: JwtTokenService,
  ) {
    this.logger = new Logger(WebsocketGateway.name);
  }

  verifyConnection(socket: Socket) {
    const authHeader = socket.handshake.auth.token as string;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new WsException('Forbidden');
    }
    const token = authHeader.split(' ')[1];
    return this.jwtTokenService.verify(token);;
  }

  async handleConnection(@ConnectedSocket() socket: Socket) {
    try {
      const payload = this.verifyConnection(socket);
      socket.data.userId = payload.id;
      this.userSocketMap.set(payload.id, socket);
      this.logger.warn(`Client ${socket.id} connected`);
    } catch (e) {
      this.logger.error('Error while connecting client:', e.message);
      socket.emit('tokenExpired');
      socket.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      this.userSocketMap.delete(userId);
    }
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  getAllSockets(): Socket[] {
    return Array.from(this.userSocketMap.values());
  }

  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody() data: SendMessageDto,
    @ConnectedSocket() socket: Socket,
  ): Promise<Record<string, string> | string> {
    try {
      const { recipients, text, chat_id } = data;
      const { userId } = socket.data;
      await this.chatService.sendMessage({ recipients, text, chat_id }, userId);
      this.server
        .to(chat_id)
        .emit('message', { text, user_id: userId, chat_id });
    } catch (error) {
      socket.emit('tokenExpired', { message: 'Token has expired' });
      return 'Error!';
    }
  }

  @SubscribeMessage('get-chats')
  async getAllUsersChats(@ConnectedSocket() socket: Socket) {
    const { userId } = socket.data;
    const chats = await this.chatService.getAllChatsByUserId(userId);
    if (chats && chats.length > 0) {
      for (const chat of chats) {
        socket.join(chat.id);
      }
    }
    return chats;
  }

  // async addSocketToRoom(rooms: string[]) {

  // }

  @SubscribeMessage('new-chat')
  async createNewChat(
    @MessageBody() data: { chat_members: User[]; name?: string },
    @ConnectedSocket() socket: Socket,
  ) {
    const newChat = await this.chatService.createNewChat({
      ...data,
      is_group_chat: data.chat_members.length > 2,
    });

    if (!newChat) {
      socket.emit('new-chat', false);
      return;
    }

    for (const member of data.chat_members) {
      const memberSocket = this.userSocketMap.get(member.id);
      if (memberSocket) {
        memberSocket.join(newChat.id);
        memberSocket.emit('new-chat', newChat);
      }
      console.log('No memberSocket found') 
    }
  }
}
