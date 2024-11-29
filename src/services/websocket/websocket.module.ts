import { Module } from '@nestjs/common';

import { ChatModule } from '../chat/chat.module';
import { JwtTokenModule } from '../jwt-token/jwt-token.module';
import { MessageModule } from '../message/message.module';

import { WebsocketGateway } from './websocket.gateway';

@Module({
  imports: [ChatModule, JwtTokenModule, MessageModule],
  providers: [WebsocketGateway],
  exports: [WebsocketGateway],
})
export class WebsocketModule {}
