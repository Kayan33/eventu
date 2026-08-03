import 'dotenv/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

const usesConnectionUrl = Boolean(process.env.DATABASE_URL);

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  ...(usesConnectionUrl
    ? { url: process.env.DATABASE_URL }
    : {
        host: process.env.POSTGRES_HOST,
        port: Number(process.env.POSTGRES_PORT),
        username: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DB,
      }),
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  synchronize: process.env.NODE_ENV !== 'production',
  logging: true,
  namingStrategy: new SnakeNamingStrategy(),
  entities: [__dirname + '/../modules/**/*.entity.{ts,js}'],
  migrations: [__dirname + '/migrations/*.{ts,js}'],
};

export const AppDataSource = new DataSource(dataSourceOptions);
export default AppDataSource;
