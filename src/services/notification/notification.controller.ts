import { Controller } from '@nestjs/common';

import { NotificationService } from './notification.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationService) {}
}
