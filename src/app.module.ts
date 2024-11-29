import { Module } from '@nestjs/common';

import { AppConfigModule } from './@config/app-config.module';
import { AppController } from './app.controller';
import { AuthModule } from './services/auth/auth.module';
import { ChatModule } from './services/chat/chat.module';
import { MessageModule } from './services/message/message.module';
import { NotificationModule } from './services/notification/notification.module';
import { UserModule } from './services/user/user.module';
import { WebsocketModule } from './services/websocket/websocket.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseInterceptor } from './@interceptors/response.interceptor';

@Module({
  imports: [
    AuthModule,
    UserModule,
    AppConfigModule,
    ChatModule,
    MessageModule,
    NotificationModule,
    WebsocketModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule {}
