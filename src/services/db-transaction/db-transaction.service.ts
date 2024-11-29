import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class DbTransactionService {
  constructor(private readonly dataSource: DataSource) {}

  async saveEntitiesInTransaction(entities: any[]): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const entity of entities) {
        await queryRunner.manager.save(entity);
      }

      await queryRunner.commitTransaction();
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
}
