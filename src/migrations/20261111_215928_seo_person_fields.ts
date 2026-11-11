import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "site_settings_knows_about" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL
  );
  
  ALTER TABLE "site_settings" ADD COLUMN "devto" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "alternate_name" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "image_id" integer;
  ALTER TABLE "site_settings_locales" ADD COLUMN "job_title" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "description" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "home_location" varchar;
  ALTER TABLE "site_settings_knows_about" ADD CONSTRAINT "site_settings_knows_about_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "site_settings_knows_about_order_idx" ON "site_settings_knows_about" USING btree ("_order");
  CREATE INDEX "site_settings_knows_about_parent_id_idx" ON "site_settings_knows_about" USING btree ("_parent_id");
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "site_settings_image_idx" ON "site_settings" USING btree ("image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings_knows_about" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "site_settings_knows_about" CASCADE;
  ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_image_id_media_id_fk";
  
  DROP INDEX "site_settings_image_idx";
  ALTER TABLE "site_settings" DROP COLUMN "devto";
  ALTER TABLE "site_settings" DROP COLUMN "alternate_name";
  ALTER TABLE "site_settings" DROP COLUMN "image_id";
  ALTER TABLE "site_settings_locales" DROP COLUMN "job_title";
  ALTER TABLE "site_settings_locales" DROP COLUMN "description";
  ALTER TABLE "site_settings_locales" DROP COLUMN "home_location";`)
}
