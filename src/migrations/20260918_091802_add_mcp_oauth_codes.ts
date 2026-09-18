import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "mcp_oauth_codes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"code_hash" varchar NOT NULL,
  	"user_id" integer NOT NULL,
  	"client_i_d" varchar NOT NULL,
  	"redirect_u_r_i" varchar NOT NULL,
  	"code_challenge" varchar NOT NULL,
  	"scope" varchar NOT NULL,
  	"expires_at" timestamp(3) with time zone NOT NULL,
  	"used_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "mcp_oauth_codes_id" integer;
  ALTER TABLE "mcp_oauth_codes" ADD CONSTRAINT "mcp_oauth_codes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "mcp_oauth_codes_code_hash_idx" ON "mcp_oauth_codes" USING btree ("code_hash");
  CREATE INDEX "mcp_oauth_codes_user_idx" ON "mcp_oauth_codes" USING btree ("user_id");
  CREATE INDEX "mcp_oauth_codes_expires_at_idx" ON "mcp_oauth_codes" USING btree ("expires_at");
  CREATE INDEX "mcp_oauth_codes_updated_at_idx" ON "mcp_oauth_codes" USING btree ("updated_at");
  CREATE INDEX "mcp_oauth_codes_created_at_idx" ON "mcp_oauth_codes" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_mcp_oauth_codes_fk" FOREIGN KEY ("mcp_oauth_codes_id") REFERENCES "public"."mcp_oauth_codes"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_mcp_oauth_codes_id_idx" ON "payload_locked_documents_rels" USING btree ("mcp_oauth_codes_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "mcp_oauth_codes" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "mcp_oauth_codes" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_mcp_oauth_codes_fk";
  
  DROP INDEX "payload_locked_documents_rels_mcp_oauth_codes_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "mcp_oauth_codes_id";`)
}
