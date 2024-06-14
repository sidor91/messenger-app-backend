import { Module } from '@nestjs/common';
import { WebsocketGateway } from './websocket.gateway';
import { ChatModule } from '../chat/chat.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [ChatModule, JwtModule],
  providers: [WebsocketGateway]
})
export class WebsocketModule {}
