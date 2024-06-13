import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MessageModule } from '../message/message.module';
import { NotificationModule } from '../notification/notification.module';
import { UserModule } from '../user/user.module';

import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { Chat } from './entity/chat.entity';

@Module({
  imports: [
    MessageModule,
    UserModule,
    NotificationModule,
    TypeOrmModule.forFeature([Chat]),
  ],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}