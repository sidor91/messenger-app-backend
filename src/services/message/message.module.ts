import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ChatModule } from '../chat/chat.module';
import { DbTransactionService } from '../db-transaction/db-transaction.service';
import { NotificationModule } from '../notification/notification.module';
import { UserModule } from '../user/user.module';

import { Message } from './entity/message.entity';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message]),
    UserModule,
    NotificationModule,
    forwardRef(() => ChatModule),
  ],
  controllers: [MessageController],
  providers: [MessageService, DbTransactionService],
  exports: [MessageService],
})
export class MessageModule {}
