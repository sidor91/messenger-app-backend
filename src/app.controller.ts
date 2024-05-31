import { Controller, Get } from '@nestjs/common';

import { Public } from './@decorators/public.decorator';

@Controller()
export class AppController {
  @Public()
  @Get()
  getAppStatus() {
    return { success: true };
  }
}
