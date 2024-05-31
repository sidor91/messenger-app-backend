import { Module } from '@nestjs/common';

import { AppConfigModule } from './config/app-config.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { ChatModule } from './modules/chat/chat.module';
import { UserModule } from './modules/user/user.module';
import { MessageModule } from './modules/message/message.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [AuthModule, UserModule, AppConfigModule, ChatModule, MessageModule, NotificationsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
