import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Message } from './entity/message.entity';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { ChatModule } from '../chat/chat.module';
import { UserModule } from '../user/user.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message]),
    UserModule,
    NotificationModule,
    forwardRef(() => ChatModule),
  ],
  controllers: [MessageController],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}
