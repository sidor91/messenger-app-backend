import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig({ path: '.env' });

const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  url: process.env.DB_URL,
  synchronize: true,
  autoLoadEntities: true,
  logging: true,
  migrations: [__dirname + '/../db/migrations/*.ts'],
};

export default registerAs('typeorm', () => databaseConfig);
