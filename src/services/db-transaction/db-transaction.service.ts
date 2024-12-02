import { DataSource } from 'typeorm';

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { Chat } from '../chat/entity/chat.entity';
import { Message } from '../message/entity/message.entity';
import { Notification } from '../notification/entity/notification.entity';

export const EntitiesMap = {
  chat: new Chat(),
  message: new Message(),
  notification: new Notification(),
};

type EntityKey = keyof typeof EntitiesMap;
export type SingleEntityValue = (typeof EntitiesMap)[EntityKey];
type MultiplyEntityValue = SingleEntityValue[];
type EntitiesType = Record<EntityKey, SingleEntityValue | MultiplyEntityValue>;

@Injectable()
export class DbTransactionService {
  constructor(private readonly dataSource: DataSource) {}

  private validateEntities(
    entities: Partial<EntitiesType>,
    saveOrder: EntityKey[],
  ) {
    const uniqueKeys = new Set(saveOrder);
    if (uniqueKeys.size !== saveOrder.length) {
      throw new Error('Duplicate keys in saveOrder');
    }

    for (const key of saveOrder) {
      if (!entities[key]) {
        throw new Error(
          `Entity with key "${key}" not found in provided entities`,
        );
      }
    }
  }

  async saveEntitiesInTransaction(
    entities: Partial<EntitiesType>,
    saveOrder: EntityKey[],
  ): Promise<Partial<EntitiesType>> {
    this.validateEntities(entities, saveOrder);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const result: Partial<EntitiesType> = {};

    try {
      for (const key of saveOrder) {
        const entity = entities[key];

        if (Array.isArray(entity)) {
          result[key] = [];
          const restEntities: MultiplyEntityValue = [];
          for (const item of entity) {
            if ('id' in item) {
              result[key].push(item);
              continue;
            } else {
              restEntities.push(item);
            }
          }
          if (restEntities.length > 0) {
            const processedEntity = this.processEntity(
              key,
              restEntities,
              result,
            );
            const savedData = await queryRunner.manager.save(processedEntity);
            if (Array.isArray(savedData)) {
              for (const item of savedData) {
                result[key].push(item);
              }
            }
          }
        } else {
          if ('id' in entity) {
            result[key] = entity;
            continue;
          }
          const processedEntity = this.processEntity(key, entity, result);
          const savedData = await queryRunner.manager.save(processedEntity);
          result[key] = savedData;
        }
      }
      await queryRunner.commitTransaction();
      return result as EntitiesType;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new HttpException(
        `Transaction failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }

  private processEntity(
    key: EntityKey,
    entity: SingleEntityValue | MultiplyEntityValue,
    result: Partial<EntitiesType>,
  ): SingleEntityValue | MultiplyEntityValue {
    if (Array.isArray(entity)) {
      return entity.map((item) =>
        this.processSingleEntity(key, item, result),
      ) as MultiplyEntityValue;
    }
    return this.processSingleEntity(key, entity, result) as SingleEntityValue;
  }

  private processSingleEntity(
    key: EntityKey,
    entity: SingleEntityValue,
    result: Partial<EntitiesType>,
  ): SingleEntityValue {
    switch (key) {
      case 'chat':
        return entity;
      case 'message':
        if (!result.chat)
          throw new Error('The chat entity should be saved before message');
        return Object.assign(entity, { chat: result.chat });
      case 'notification':
        if (!result.chat && !result.message)
          throw new Error(
            'The chat and message entities are should be saved before message',
          );
        return Object.assign(entity, {
          message: result.message,
          chat: result.chat,
        });
      default:
        throw new Error(`Unknown entity type: ${key}`);
    }
  }
}
