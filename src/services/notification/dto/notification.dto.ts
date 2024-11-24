import { ApiProperty } from "@nestjs/swagger";
import { CommonColumns } from "src/common/entities/common.entity";
import { NotificationEnum } from "../entity/notification.entity";

export class NotificationDto extends CommonColumns {
  @ApiProperty({
    type: String,
    enum: NotificationEnum,
  })
  type: NotificationEnum;
}