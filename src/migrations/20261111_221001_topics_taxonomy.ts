import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "topics" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar NOT NULL,
  	"pillar_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "topics_locales" (
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "posts" ADD COLUMN "topic_id" integer;
  ALTER TABLE "posts_rels" ADD COLUMN "posts_id" integer;
  ALTER TABLE "_posts_v" ADD COLUMN "version_topic_id" integer;
  ALTER TABLE "_posts_v_rels" ADD COLUMN "posts_id" integer;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "topics_find" boolean DEFAULT false;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "topics_id" integer;
  ALTER TABLE "topics" ADD CONSTRAINT "topics_pillar_id_posts_id_fk" FOREIGN KEY ("pillar_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "topics_locales" ADD CONSTRAINT "topics_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "topics_slug_idx" ON "topics" USING btree ("slug");
  CREATE INDEX "topics_pillar_idx" ON "topics" USING btree ("pillar_id");
  CREATE INDEX "topics_updated_at_idx" ON "topics" USING btree ("updated_at");
  CREATE INDEX "topics_created_at_idx" ON "topics" USING btree ("created_at");
  CREATE INDEX "topics_title_idx" ON "topics_locales" USING btree ("title","_locale");
  CREATE UNIQUE INDEX "topics_locales_locale_parent_id_unique" ON "topics_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "posts" ADD CONSTRAINT "posts_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_topic_id_topics_id_fk" FOREIGN KEY ("version_topic_id") REFERENCES "public"."topics"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_topics_fk" FOREIGN KEY ("topics_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "posts_topic_idx" ON "posts" USING btree ("topic_id");
  CREATE INDEX "posts_rels_posts_id_idx" ON "posts_rels" USING btree ("posts_id");
  CREATE INDEX "_posts_v_version_version_topic_idx" ON "_posts_v" USING btree ("version_topic_id");
  CREATE INDEX "_posts_v_rels_posts_id_idx" ON "_posts_v_rels" USING btree ("posts_id");
  CREATE INDEX "payload_locked_documents_rels_topics_id_idx" ON "payload_locked_documents_rels" USING btree ("topics_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "topics" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "topics_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "topics" CASCADE;
  DROP TABLE "topics_locales" CASCADE;
  ALTER TABLE "posts" DROP CONSTRAINT IF EXISTS "posts_topic_id_topics_id_fk";
  
  ALTER TABLE "posts_rels" DROP CONSTRAINT IF EXISTS "posts_rels_posts_fk";
  
  ALTER TABLE "_posts_v" DROP CONSTRAINT IF EXISTS "_posts_v_version_topic_id_topics_id_fk";
  
  ALTER TABLE "_posts_v_rels" DROP CONSTRAINT IF EXISTS "_posts_v_rels_posts_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_topics_fk";
  
  DROP INDEX IF EXISTS "posts_topic_idx";
  DROP INDEX IF EXISTS "posts_rels_posts_id_idx";
  DROP INDEX IF EXISTS "_posts_v_version_version_topic_idx";
  DROP INDEX IF EXISTS "_posts_v_rels_posts_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_topics_id_idx";
  ALTER TABLE "posts" DROP COLUMN "topic_id";
  ALTER TABLE "posts_rels" DROP COLUMN "posts_id";
  ALTER TABLE "_posts_v" DROP COLUMN "version_topic_id";
  ALTER TABLE "_posts_v_rels" DROP COLUMN "posts_id";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "topics_find";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "topics_id";`)
}
