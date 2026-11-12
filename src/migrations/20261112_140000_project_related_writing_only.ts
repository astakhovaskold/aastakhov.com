import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * The `selectedCaseNotes` field was removed from Projects; only `relatedWriting` remains.
 * Move existing relations over (skipping ones already present) so no links are lost.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DELETE FROM "projects_rels" a USING "projects_rels" b
     WHERE a."path" = 'selectedCaseNotes'
       AND b."path" = 'relatedWriting'
       AND a."parent_id" = b."parent_id"
       AND a."posts_id" = b."posts_id";
   UPDATE "projects_rels" SET "path" = 'relatedWriting' WHERE "path" = 'selectedCaseNotes';`)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Moved relations cannot be told apart from the original relatedWriting rows.
}
