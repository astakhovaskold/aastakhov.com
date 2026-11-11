import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "site_settings_proof" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "site_settings_proof_locales" (
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  ALTER TABLE "site_settings_proof" ADD CONSTRAINT "site_settings_proof_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_proof_locales" ADD CONSTRAINT "site_settings_proof_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings_proof"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "site_settings_proof_order_idx" ON "site_settings_proof" USING btree ("_order");
  CREATE INDEX "site_settings_proof_parent_id_idx" ON "site_settings_proof" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "site_settings_proof_locales_locale_parent_id_unique" ON "site_settings_proof_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "site_settings_proof" CASCADE;
  DROP TABLE "site_settings_proof_locales" CASCADE;`)
}
