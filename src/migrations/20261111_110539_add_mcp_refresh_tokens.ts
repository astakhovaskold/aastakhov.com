import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "mcp_oauth_codes" ADD COLUMN "refresh_token_hash" varchar;
  ALTER TABLE "mcp_oauth_codes" ADD COLUMN "refresh_token_expires_at" timestamp(3) with time zone;
  ALTER TABLE "mcp_oauth_codes" ADD COLUMN "refresh_token_used_at" timestamp(3) with time zone;
  CREATE INDEX "mcp_oauth_codes_refresh_token_hash_idx" ON "mcp_oauth_codes" USING btree ("refresh_token_hash");
  CREATE INDEX "mcp_oauth_codes_refresh_token_expires_at_idx" ON "mcp_oauth_codes" USING btree ("refresh_token_expires_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "mcp_oauth_codes_refresh_token_hash_idx";
  DROP INDEX "mcp_oauth_codes_refresh_token_expires_at_idx";
  ALTER TABLE "mcp_oauth_codes" DROP COLUMN "refresh_token_hash";
  ALTER TABLE "mcp_oauth_codes" DROP COLUMN "refresh_token_expires_at";
  ALTER TABLE "mcp_oauth_codes" DROP COLUMN "refresh_token_used_at";`)
}
