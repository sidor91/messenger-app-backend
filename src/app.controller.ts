import { Controller, Get } from '@nestjs/common';

import { Public } from './@decorators/public.decorator';

@Controller()
export class AppController {

  @Public()
  @Get()
  geto() {
    return { success: true };
  }
}
