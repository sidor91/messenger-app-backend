import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { ChatService } from '../chat/chat.service';
import { Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { UseGuards } from '@nestjs/common';
import { JwtAccessAuthGuard } from 'src/@guards/jwt-access-auth.guard';

@WebSocketGateway()
export class WebsocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(@ConnectedSocket() client: Socket, ...args: any[]) {
    // try {
    //   const token = client.handshake.query.token as string;
    //   const payload = this.jwtService.verify(token);
    //   console.log('payload', payload);
    //   // client.data.user = payload;
    // } catch (e) {
    //   console.log('error', e);
    //   client.disconnect(); // Отключить клиента при неудачной аутентификации
    // }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @UseGuards(JwtAccessAuthGuard)
  @SubscribeMessage('message')
  handleMessage(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ): string {
    return 'Hello world!';
  }
}
