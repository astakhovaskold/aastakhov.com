import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE IF NOT EXISTS "projects_highlights" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );

  CREATE TABLE IF NOT EXISTS "projects_highlights_locales" (
  	"label" varchar NOT NULL,
  	"value" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );

  ALTER TABLE "projects_highlights" DROP CONSTRAINT IF EXISTS "projects_highlights_parent_id_fk";
  ALTER TABLE "projects_highlights_locales" DROP CONSTRAINT IF EXISTS "projects_highlights_locales_parent_id_fk";
  ALTER TABLE "projects_highlights" ADD CONSTRAINT "projects_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_highlights_locales" ADD CONSTRAINT "projects_highlights_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects_highlights"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX IF NOT EXISTS "projects_highlights_order_idx" ON "projects_highlights" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "projects_highlights_parent_id_idx" ON "projects_highlights" USING btree ("_parent_id");
  CREATE UNIQUE INDEX IF NOT EXISTS "projects_highlights_locales_locale_parent_id_unique" ON "projects_highlights_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE IF EXISTS "projects_highlights_locales" CASCADE;
  DROP TABLE IF EXISTS "projects_highlights" CASCADE;`)
}
