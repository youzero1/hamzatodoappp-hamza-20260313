import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Todo } from '@/entities/Todo';
import path from 'path';

const dbPath = process.env.DATABASE_PATH
  ? path.resolve(process.cwd(), process.env.DATABASE_PATH)
  : path.resolve(process.cwd(), 'database.sqlite');

let AppDataSource: DataSource | null = null;

export function getDataSource(): DataSource {
  if (!AppDataSource) {
    AppDataSource = new DataSource({
      type: 'better-sqlite3',
      database: dbPath,
      synchronize: true,
      logging: false,
      entities: [Todo],
    });
  }
  return AppDataSource;
}

export async function getInitializedDataSource(): Promise<DataSource> {
  const ds = getDataSource();
  if (!ds.isInitialized) {
    await ds.initialize();
  }
  return ds;
}
