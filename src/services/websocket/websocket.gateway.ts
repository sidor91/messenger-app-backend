import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { PaginationDto } from 'src/common/dto/pagination.dto';

import { ChatService } from '../chat/chat.service';
import { CreateGroupChatDto } from '../chat/dto/create-group-chat.dto';
import { JwtTokenService } from '../jwt-token/jwt-token.service';
import { SendGroupMessageDto } from '../message/dto/send-group-message.dto';
import { SendPrivateMessageDto } from '../message/dto/send-private-message.dto';
import { MessageService } from '../message/message.service';

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
    private readonly chatService: ChatService,
    private readonly messageService: MessageService,
    private readonly jwtTokenService: JwtTokenService,
  ) {
    this.logger = new Logger(WebsocketGateway.name);
  }

  private async verifyConnection(socket: Socket) {
    const authHeader = socket.handshake.auth.token as string;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      this.emitError(socket, 'Forbidden');
      return;
    }
    const token = authHeader.split(' ')[1];
    return await this.jwtTokenService.verify(token);
  }

  async handleConnection(@ConnectedSocket() socket: Socket) {
    try {
      const payload = await this.verifyConnection(socket);
      socket.data.currentUserId = payload.id;
      this.userSocketMap.set(payload.id, socket);
      await this.addSocketToMultiplyRooms(socket);
      this.logger.warn(`Client ${socket.id} connected`);
    } catch (e) {
      this.logger.error('Error while connecting client:', e.message);
      this.emitError(socket, `${e.message}`);
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

  @SubscribeMessage('private-message')
  async handlePrivateMessage(
    @MessageBody() data: SendPrivateMessageDto,
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      const { currentUserId } = socket.data;

      if (!data.chat_id && !data.recipient) {
        this.emitError(socket, 'Data should have either chat_id or recipient');
        return;
      }

      const {
        chat_id,
        sender,
        text,
        id: message_id,
      } = await this.messageService.sendPrivateMessage(data, currentUserId);

      if (!data.chat_id) {
        const socketsToJoinTheRoom = [currentUserId, data.recipient].map((id) =>
          this.userSocketMap.get(id),
        );
        for (const socket of socketsToJoinTheRoom) {
          if (socket) {
            socket.join(chat_id);
          } else {
            console.warn(`Socket for user ${data.recipient} not found`);
          }
        }
      }
      this.server.to(chat_id).emit('message', {
        message_id,
        text: text,
        from: sender,
        chat_id: chat_id,
      });
    } catch (error) {
      this.logger.error('Error handling private message:', error);
      this.emitError(
        socket,
        `${error.message || 'An unexpected error occurred'}`,
      );
      return;
    }
  }

  @SubscribeMessage('group-message')
  async handleGroupMessage(
    @MessageBody() data: SendGroupMessageDto,
    @ConnectedSocket() socket: Socket,
  ): Promise<Record<string, string> | string> {
    try {
      const { text, chat_id } = data;
      const { currentUserId } = socket.data;
      await this.messageService.sendGroupMessage(data, currentUserId);
      this.server.to(chat_id).emit('message', {
        text,
        from: currentUserId,
        chat_id,
      });
    } catch (error) {
      socket.emit('tokenExpired', { message: 'Token has expired' });
      return 'Error!';
    }
  }

  @SubscribeMessage('get-all-chats')
  async getAllUsersChats(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { params?: PaginationDto },
  ) {
    const { currentUserI } = socket.data;
    const { chats, chatsCount } = await this.chatService.getAllChatsByUserId(
      currentUserI,
      data.params,
    );
    // TODO before adding - check if room hasn't this socket
    if (chats && chatsCount > 0) {
      for (const chat of chats) {
        socket.join(chat.id);
      }
    }
    return chats;
  }

  // @SubscribeMessage('get-chat')
  // async getChatById(
  //   @ConnectedSocket() socket: Socket,
  //   @MessageBody() data: { id: string; params?: PaginationDto },
  // ) {
  //   const { currentUserI } = socket.data;
  //   const { chats, chatsCount } =
  //     await this.chatService.getAllChatsByUserId(currentUserI);
  //   if (chats && chatsCount > 0) {
  //     for (const chat of chats) {
  //       socket.join(chat.id);
  //     }
  //   }
  //   return chats;
  // }

  @SubscribeMessage('new-group-chat')
  async createNewChat(
    @MessageBody() data: CreateGroupChatDto,
    @ConnectedSocket() socket: Socket,
  ) {
    const { currentUserId } = socket.data;

    const newChat = await this.chatService.createNewGroupChat(
      data,
      currentUserId,
    );

    if (!newChat) {
      this.emitError(socket, 'Failed to create a new group chat.');
      return;
    }

    for (const id of data.userIds) {
      const memberSocket = this.userSocketMap.get(id);
      if (memberSocket) {
        memberSocket.join(newChat.id);
        memberSocket.emit('chat-created', {
          chatId: newChat.id,
          name: newChat.name,
        });
      } else {
        console.warn(`User with ID ${id} is offline or not connected.`);
      }
    }

    return { success: true, chatId: newChat.id };
  }

  private addMultiplySocketsToRoom(roomId: string, sockets: Socket[]) {
    for (const socket of sockets) {
      if (socket) {
        socket.join(roomId);
      } else {
        console.warn(`Socket for user ${socket.data.currentUserId} not found`);
      }
    }
  }

  private async addSocketToMultiplyRooms(socket: Socket) {
    const { currentUserId } = socket.data;
    const roomsAvailable =
      await this.chatService.getUserChatIdsByUserId(currentUserId);

    if (roomsAvailable.length > 0) {
      for (const room of roomsAvailable) {
        socket.join(room);
      }
    }
  }

  private emitError(socket: Socket, message: string) {
    socket.emit('error', { message });
  }
}
