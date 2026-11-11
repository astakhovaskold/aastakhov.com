import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "posts" ADD COLUMN "last_modified" timestamp(3) with time zone;
  ALTER TABLE "_posts_v" ADD COLUMN "version_last_modified" timestamp(3) with time zone;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "media_create" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "media_update" boolean DEFAULT false;
  CREATE INDEX "posts_last_modified_idx" ON "posts" USING btree ("last_modified");
  CREATE INDEX "_posts_v_version_version_last_modified_idx" ON "_posts_v" USING btree ("version_last_modified");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "posts_last_modified_idx";
  DROP INDEX "_posts_v_version_version_last_modified_idx";
  ALTER TABLE "posts" DROP COLUMN "last_modified";
  ALTER TABLE "_posts_v" DROP COLUMN "version_last_modified";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "media_create";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "media_update";`)
}
