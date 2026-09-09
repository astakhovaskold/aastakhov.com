import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "site_settings_home_page_hero_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "site_settings_home_page_hero_tags_locales" (
  	"title" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  ALTER TABLE "site_settings_locales" ADD COLUMN "home_page_hero_title_line1" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "home_page_hero_title_line2" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "home_page_hero_description" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "blog_page_title" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "blog_page_description" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "projects_page_title" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "projects_page_description" varchar;
  ALTER TABLE "site_settings_home_page_hero_tags" ADD CONSTRAINT "site_settings_home_page_hero_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_home_page_hero_tags_locales" ADD CONSTRAINT "site_settings_home_page_hero_tags_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings_home_page_hero_tags"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "site_settings_home_page_hero_tags_order_idx" ON "site_settings_home_page_hero_tags" USING btree ("_order");
  CREATE INDEX "site_settings_home_page_hero_tags_parent_id_idx" ON "site_settings_home_page_hero_tags" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "site_settings_home_page_hero_tags_locales_locale_parent_id_u" ON "site_settings_home_page_hero_tags_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "site_settings_home_page_hero_tags" CASCADE;
  DROP TABLE "site_settings_home_page_hero_tags_locales" CASCADE;
  ALTER TABLE "site_settings_locales" DROP COLUMN "home_page_hero_title_line1";
  ALTER TABLE "site_settings_locales" DROP COLUMN "home_page_hero_title_line2";
  ALTER TABLE "site_settings_locales" DROP COLUMN "home_page_hero_description";
  ALTER TABLE "site_settings_locales" DROP COLUMN "blog_page_title";
  ALTER TABLE "site_settings_locales" DROP COLUMN "blog_page_description";
  ALTER TABLE "site_settings_locales" DROP COLUMN "projects_page_title";
  ALTER TABLE "site_settings_locales" DROP COLUMN "projects_page_description";`)
}
