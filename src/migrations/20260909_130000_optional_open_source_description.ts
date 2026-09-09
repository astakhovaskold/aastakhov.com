import { sql, type MigrateDownArgs, type MigrateUpArgs } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "open_source_locales" ALTER COLUMN "description" DROP NOT NULL;
    ALTER TABLE "_open_source_v_locales" ALTER COLUMN "version_description" DROP NOT NULL;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "open_source_locales" SET "description" = '' WHERE "description" IS NULL;
    UPDATE "_open_source_v_locales" SET "version_description" = '' WHERE "version_description" IS NULL;
    ALTER TABLE "open_source_locales" ALTER COLUMN "description" SET NOT NULL;
    ALTER TABLE "_open_source_v_locales" ALTER COLUMN "version_description" SET NOT NULL;
  `)
}
