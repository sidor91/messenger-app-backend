import { Module } from '@nestjs/common';

import { AppConfigModule } from './app-config/app-config.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './services/auth/auth.module';
import { UserModule } from './services/user/user.module';

@Module({
  imports: [UserModule, AppConfigModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
