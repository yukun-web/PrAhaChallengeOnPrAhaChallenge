import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import * as process from "node:process";
import * as path from "node:path";
import * as fs from "node:fs";
import { eq } from "drizzle-orm";
import { AggregateTable, Database } from "@ponp/fundamental";

/**
 * 子パッケージのテストからプロジェクトルートのパスを取得します。
 * 祖先ディレクトリのうち直近の `turbo.json` が存在するディレクトリをプロジェクトルートとみなします。
 *
 * @returns プロジェクトルートのパスを返します。
 */
const getProjectRootPath = () => {
  let currentDir = process.cwd();

  while (currentDir !== path.parse(currentDir).root) {
    const turboJsonPath = path.join(currentDir, "turbo.json");
    if (fs.existsSync(turboJsonPath)) {
      return currentDir;
    }
    currentDir = path.dirname(currentDir);
  }

  throw new Error("プロジェクトルートが見つかりませんでした。");
};

/**
 * マイグレーション済みの PGLite に接続された Drizzle インスタンスを作成します。
 *
 * @returns マイグレーション済みの PGLite に接続された Drizzle インスタンスを返します。
 */
export const createInMemoryDatabase = async () => {
  const db = drizzle({ client: new PGlite() });

  const projectRootPath = getProjectRootPath();
  const migrationsFolder = `${projectRootPath}/supabase/migrations`;
  await migrate(db, { migrationsFolder });

  return db;
};

/**
 * 指定した ID のレコードを取得します。
 *
 * @param db - データベース接続インスタンスを指定します。
 * @param table - 検索対象のテーブルを指定します。テーブルには id カラムが必要です。
 * @param id - 取得するレコードの ID を指定します。
 * @returns 指定した ID のレコードを返します。レコードが存在しない場合は undefined を返します。
 */
export const getRecordById = async (db: Database, table: AggregateTable, id: string) => {
  const [record] = await db.select().from(table).where(eq(table.id, id)).limit(1).execute();
  return record as { id: string; data: unknown } | undefined;
};
