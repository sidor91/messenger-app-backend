import { forwardRef, Module } from '@nestjs/common';

import { ChatModule } from '../chat/chat.module';
import { JwtTokenModule } from '../jwt-token/jwt-token.module';

import { WebsocketGateway } from './websocket.gateway';
import { MessageModule } from '../message/message.module';

@Module({
  imports: [forwardRef(() => ChatModule), JwtTokenModule, MessageModule],
  providers: [WebsocketGateway],
  exports: [WebsocketGateway],
})
export class WebsocketModule {}
