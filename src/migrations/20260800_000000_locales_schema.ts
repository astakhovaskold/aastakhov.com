import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('ru', 'en');
  CREATE TYPE "public"."enum_projects_status" AS ENUM('active', 'in-progress', 'concept', 'paused', 'archived', 'future');
  CREATE TYPE "public"."enum_projects_type" AS ENUM('company', 'product', 'website', 'brand', 'concept', 'experiment');
  CREATE TYPE "public"."enum__projects_v_version_status" AS ENUM('active', 'in-progress', 'concept', 'paused', 'archived', 'future');
  CREATE TYPE "public"."enum__projects_v_version_type" AS ENUM('company', 'product', 'website', 'brand', 'concept', 'experiment');
  CREATE TYPE "public"."enum_posts_category" AS ENUM('article', 'case', 'note', 'guide', 'essay');
  CREATE TYPE "public"."enum__posts_v_version_category" AS ENUM('article', 'case', 'note', 'guide', 'essay');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "media_locales" (
  	"alt" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "projects_related_posts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL
  );
  
  CREATE TABLE "projects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar NOT NULL,
  	"status" "enum_projects_status" DEFAULT 'active' NOT NULL,
  	"published" boolean DEFAULT true,
  	"type" "enum_projects_type" DEFAULT 'product' NOT NULL,
  	"started_at" timestamp(3) with time zone,
  	"year" numeric,
  	"preview_image_id" integer,
  	"cover_image_id" integer,
  	"external_url" varchar,
  	"featured" boolean DEFAULT false,
  	"order" numeric DEFAULT 100,
  	"seo_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "projects_locales" (
  	"title" varchar NOT NULL,
  	"description" varchar NOT NULL,
  	"eyebrow" varchar,
  	"role" varchar,
  	"focus" varchar,
  	"content" jsonb,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "projects_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"posts_id" integer
  );
  
  CREATE TABLE "_projects_v_version_related_posts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_projects_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar NOT NULL,
  	"version_status" "enum__projects_v_version_status" DEFAULT 'active' NOT NULL,
  	"version_published" boolean DEFAULT true,
  	"version_type" "enum__projects_v_version_type" DEFAULT 'product' NOT NULL,
  	"version_started_at" timestamp(3) with time zone,
  	"version_year" numeric,
  	"version_preview_image_id" integer,
  	"version_cover_image_id" integer,
  	"version_external_url" varchar,
  	"version_featured" boolean DEFAULT false,
  	"version_order" numeric DEFAULT 100,
  	"version_seo_image_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_projects_v_locales" (
  	"version_title" varchar NOT NULL,
  	"version_description" varchar NOT NULL,
  	"version_eyebrow" varchar,
  	"version_role" varchar,
  	"version_focus" varchar,
  	"version_content" jsonb,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_projects_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"posts_id" integer
  );
  
  CREATE TABLE "post_categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar NOT NULL,
  	"order" numeric DEFAULT 10,
  	"show_in_posts_navigation" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "post_categories_locales" (
  	"title" varchar NOT NULL,
  	"singular_label" varchar NOT NULL,
  	"description" varchar,
  	"eyebrow" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "posts_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "posts_tags_locales" (
  	"tag" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar NOT NULL,
  	"published_at" timestamp(3) with time zone,
  	"reading_time" numeric,
  	"category" "enum_posts_category" DEFAULT 'article',
  	"post_category_id" integer NOT NULL,
  	"preview_image_id" integer,
  	"cover_image_id" integer,
  	"featured" boolean DEFAULT false,
  	"show_on_home" boolean DEFAULT false,
  	"seo_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "posts_locales" (
  	"title" varchar NOT NULL,
  	"description" varchar NOT NULL,
  	"eyebrow" varchar,
  	"content" jsonb,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "posts_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"projects_id" integer
  );
  
  CREATE TABLE "_posts_v_version_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_posts_v_version_tags_locales" (
  	"tag" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_posts_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar NOT NULL,
  	"version_published_at" timestamp(3) with time zone,
  	"version_reading_time" numeric,
  	"version_category" "enum__posts_v_version_category" DEFAULT 'article',
  	"version_post_category_id" integer NOT NULL,
  	"version_preview_image_id" integer,
  	"version_cover_image_id" integer,
  	"version_featured" boolean DEFAULT false,
  	"version_show_on_home" boolean DEFAULT false,
  	"version_seo_image_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_posts_v_locales" (
  	"version_title" varchar NOT NULL,
  	"version_description" varchar NOT NULL,
  	"version_eyebrow" varchar,
  	"version_content" jsonb,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_posts_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"projects_id" integer
  );
  
  CREATE TABLE "open_source" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"github_url" varchar NOT NULL,
  	"article_url" varchar,
  	"stars" numeric DEFAULT 0,
  	"featured" boolean DEFAULT false,
  	"order" numeric DEFAULT 100,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "open_source_locales" (
  	"name" varchar NOT NULL,
  	"description" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_open_source_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_github_url" varchar NOT NULL,
  	"version_article_url" varchar,
  	"version_stars" numeric DEFAULT 0,
  	"version_featured" boolean DEFAULT false,
  	"version_order" numeric DEFAULT 100,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_open_source_v_locales" (
  	"version_name" varchar NOT NULL,
  	"version_description" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"projects_id" integer,
  	"post_categories_id" integer,
  	"posts_id" integer,
  	"open_source_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_settings_selected_work" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"post_id" integer NOT NULL
  );
  
  CREATE TABLE "site_settings_selected_work_locales" (
  	"caption" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings_services" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "site_settings_services_locales" (
  	"title" varchar NOT NULL,
  	"description" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar DEFAULT 'Askold Astakhov' NOT NULL,
  	"email" varchar DEFAULT 'astakhovaskold@gmail.com' NOT NULL,
  	"phone" varchar,
  	"telegram" varchar DEFAULT 'https://t.me/askold_astakhov',
  	"linkedin" varchar DEFAULT 'https://www.linkedin.com/in/askold-astakhov/',
  	"github" varchar,
  	"booking_url" varchar,
  	"seo_default_image_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "site_settings_locales" (
  	"location" varchar,
  	"availability" varchar DEFAULT 'Available for selected projects',
  	"home_eyebrow" varchar,
  	"projects_eyebrow" varchar,
  	"posts_eyebrow" varchar,
  	"seo_default_title" varchar DEFAULT 'Askold Astakhov' NOT NULL,
  	"seo_default_description" varchar DEFAULT 'Personal site for Askold Astakhov.' NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "cv_expertise" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "cv_expertise_locales" (
  	"title" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "cv_experience_highlights" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "cv_experience_highlights_locales" (
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "cv_experience" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"start_date" timestamp(3) with time zone,
  	"end_date" timestamp(3) with time zone,
  	"current" boolean DEFAULT false
  );
  
  CREATE TABLE "cv_experience_locales" (
  	"company" varchar,
  	"role" varchar,
  	"location" varchar,
  	"summary" varchar,
  	"stack" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "cv_skills_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "cv_skills_items_locales" (
  	"name" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "cv_skills" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "cv_skills_locales" (
  	"category" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "cv_education" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"start_year" numeric,
  	"end_year" numeric
  );
  
  CREATE TABLE "cv_education_locales" (
  	"institution" varchar,
  	"degree" varchar,
  	"field" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "cv_languages" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "cv_languages_locales" (
  	"language" varchar,
  	"level" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "cv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"pdf_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "cv_locales" (
  	"name" varchar,
  	"eyebrow" varchar,
  	"role" varchar,
  	"location" varchar,
  	"summary" varchar,
  	"focus" varchar,
  	"stack" varchar,
  	"expertise_note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_locales" ADD CONSTRAINT "media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_related_posts" ADD CONSTRAINT "projects_related_posts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_preview_image_id_media_id_fk" FOREIGN KEY ("preview_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_locales" ADD CONSTRAINT "projects_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_rels" ADD CONSTRAINT "projects_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_rels" ADD CONSTRAINT "projects_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_version_related_posts" ADD CONSTRAINT "_projects_v_version_related_posts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_parent_id_projects_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_preview_image_id_media_id_fk" FOREIGN KEY ("version_preview_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_cover_image_id_media_id_fk" FOREIGN KEY ("version_cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_locales" ADD CONSTRAINT "_projects_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_rels" ADD CONSTRAINT "_projects_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_rels" ADD CONSTRAINT "_projects_v_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "post_categories_locales" ADD CONSTRAINT "post_categories_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."post_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_tags" ADD CONSTRAINT "posts_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_tags_locales" ADD CONSTRAINT "posts_tags_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_post_category_id_post_categories_id_fk" FOREIGN KEY ("post_category_id") REFERENCES "public"."post_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_preview_image_id_media_id_fk" FOREIGN KEY ("preview_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_locales" ADD CONSTRAINT "posts_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_version_tags" ADD CONSTRAINT "_posts_v_version_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_version_tags_locales" ADD CONSTRAINT "_posts_v_version_tags_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v_version_tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_parent_id_posts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_post_category_id_post_categories_id_fk" FOREIGN KEY ("version_post_category_id") REFERENCES "public"."post_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_preview_image_id_media_id_fk" FOREIGN KEY ("version_preview_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_cover_image_id_media_id_fk" FOREIGN KEY ("version_cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_locales" ADD CONSTRAINT "_posts_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "open_source_locales" ADD CONSTRAINT "open_source_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."open_source"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_open_source_v" ADD CONSTRAINT "_open_source_v_parent_id_open_source_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."open_source"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_open_source_v_locales" ADD CONSTRAINT "_open_source_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_open_source_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_post_categories_fk" FOREIGN KEY ("post_categories_id") REFERENCES "public"."post_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_open_source_fk" FOREIGN KEY ("open_source_id") REFERENCES "public"."open_source"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_selected_work" ADD CONSTRAINT "site_settings_selected_work_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_selected_work" ADD CONSTRAINT "site_settings_selected_work_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_selected_work_locales" ADD CONSTRAINT "site_settings_selected_work_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings_selected_work"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_services" ADD CONSTRAINT "site_settings_services_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_services_locales" ADD CONSTRAINT "site_settings_services_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings_services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_seo_default_image_id_media_id_fk" FOREIGN KEY ("seo_default_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_locales" ADD CONSTRAINT "site_settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cv_expertise" ADD CONSTRAINT "cv_expertise_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cv"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cv_expertise_locales" ADD CONSTRAINT "cv_expertise_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cv_expertise"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cv_experience_highlights" ADD CONSTRAINT "cv_experience_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cv_experience"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cv_experience_highlights_locales" ADD CONSTRAINT "cv_experience_highlights_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cv_experience_highlights"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cv_experience" ADD CONSTRAINT "cv_experience_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cv"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cv_experience_locales" ADD CONSTRAINT "cv_experience_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cv_experience"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cv_skills_items" ADD CONSTRAINT "cv_skills_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cv_skills"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cv_skills_items_locales" ADD CONSTRAINT "cv_skills_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cv_skills_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cv_skills" ADD CONSTRAINT "cv_skills_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cv"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cv_skills_locales" ADD CONSTRAINT "cv_skills_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cv_skills"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cv_education" ADD CONSTRAINT "cv_education_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cv"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cv_education_locales" ADD CONSTRAINT "cv_education_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cv_education"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cv_languages" ADD CONSTRAINT "cv_languages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cv"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cv_languages_locales" ADD CONSTRAINT "cv_languages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cv_languages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cv" ADD CONSTRAINT "cv_pdf_id_media_id_fk" FOREIGN KEY ("pdf_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cv_locales" ADD CONSTRAINT "cv_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cv"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE UNIQUE INDEX "media_locales_locale_parent_id_unique" ON "media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "projects_related_posts_order_idx" ON "projects_related_posts" USING btree ("_order");
  CREATE INDEX "projects_related_posts_parent_id_idx" ON "projects_related_posts" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "projects_slug_idx" ON "projects" USING btree ("slug");
  CREATE INDEX "projects_published_idx" ON "projects" USING btree ("published");
  CREATE INDEX "projects_preview_image_idx" ON "projects" USING btree ("preview_image_id");
  CREATE INDEX "projects_cover_image_idx" ON "projects" USING btree ("cover_image_id");
  CREATE INDEX "projects_featured_idx" ON "projects" USING btree ("featured");
  CREATE INDEX "projects_order_idx" ON "projects" USING btree ("order");
  CREATE INDEX "projects_seo_seo_image_idx" ON "projects" USING btree ("seo_image_id");
  CREATE INDEX "projects_updated_at_idx" ON "projects" USING btree ("updated_at");
  CREATE INDEX "projects_created_at_idx" ON "projects" USING btree ("created_at");
  CREATE INDEX "projects_title_idx" ON "projects_locales" USING btree ("title","_locale");
  CREATE UNIQUE INDEX "projects_locales_locale_parent_id_unique" ON "projects_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "projects_rels_order_idx" ON "projects_rels" USING btree ("order");
  CREATE INDEX "projects_rels_parent_idx" ON "projects_rels" USING btree ("parent_id");
  CREATE INDEX "projects_rels_path_idx" ON "projects_rels" USING btree ("path");
  CREATE INDEX "projects_rels_posts_id_idx" ON "projects_rels" USING btree ("posts_id");
  CREATE INDEX "_projects_v_version_related_posts_order_idx" ON "_projects_v_version_related_posts" USING btree ("_order");
  CREATE INDEX "_projects_v_version_related_posts_parent_id_idx" ON "_projects_v_version_related_posts" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_parent_idx" ON "_projects_v" USING btree ("parent_id");
  CREATE INDEX "_projects_v_version_version_slug_idx" ON "_projects_v" USING btree ("version_slug");
  CREATE INDEX "_projects_v_version_version_published_idx" ON "_projects_v" USING btree ("version_published");
  CREATE INDEX "_projects_v_version_version_preview_image_idx" ON "_projects_v" USING btree ("version_preview_image_id");
  CREATE INDEX "_projects_v_version_version_cover_image_idx" ON "_projects_v" USING btree ("version_cover_image_id");
  CREATE INDEX "_projects_v_version_version_featured_idx" ON "_projects_v" USING btree ("version_featured");
  CREATE INDEX "_projects_v_version_version_order_idx" ON "_projects_v" USING btree ("version_order");
  CREATE INDEX "_projects_v_version_seo_version_seo_image_idx" ON "_projects_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_projects_v_version_version_updated_at_idx" ON "_projects_v" USING btree ("version_updated_at");
  CREATE INDEX "_projects_v_version_version_created_at_idx" ON "_projects_v" USING btree ("version_created_at");
  CREATE INDEX "_projects_v_created_at_idx" ON "_projects_v" USING btree ("created_at");
  CREATE INDEX "_projects_v_updated_at_idx" ON "_projects_v" USING btree ("updated_at");
  CREATE INDEX "_projects_v_version_version_title_idx" ON "_projects_v_locales" USING btree ("version_title","_locale");
  CREATE UNIQUE INDEX "_projects_v_locales_locale_parent_id_unique" ON "_projects_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_projects_v_rels_order_idx" ON "_projects_v_rels" USING btree ("order");
  CREATE INDEX "_projects_v_rels_parent_idx" ON "_projects_v_rels" USING btree ("parent_id");
  CREATE INDEX "_projects_v_rels_path_idx" ON "_projects_v_rels" USING btree ("path");
  CREATE INDEX "_projects_v_rels_posts_id_idx" ON "_projects_v_rels" USING btree ("posts_id");
  CREATE UNIQUE INDEX "post_categories_slug_idx" ON "post_categories" USING btree ("slug");
  CREATE INDEX "post_categories_order_idx" ON "post_categories" USING btree ("order");
  CREATE INDEX "post_categories_updated_at_idx" ON "post_categories" USING btree ("updated_at");
  CREATE INDEX "post_categories_created_at_idx" ON "post_categories" USING btree ("created_at");
  CREATE INDEX "post_categories_title_idx" ON "post_categories_locales" USING btree ("title","_locale");
  CREATE UNIQUE INDEX "post_categories_locales_locale_parent_id_unique" ON "post_categories_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "posts_tags_order_idx" ON "posts_tags" USING btree ("_order");
  CREATE INDEX "posts_tags_parent_id_idx" ON "posts_tags" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "posts_tags_locales_locale_parent_id_unique" ON "posts_tags_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "posts_slug_idx" ON "posts" USING btree ("slug");
  CREATE INDEX "posts_published_at_idx" ON "posts" USING btree ("published_at");
  CREATE INDEX "posts_category_idx" ON "posts" USING btree ("category");
  CREATE INDEX "posts_post_category_idx" ON "posts" USING btree ("post_category_id");
  CREATE INDEX "posts_preview_image_idx" ON "posts" USING btree ("preview_image_id");
  CREATE INDEX "posts_cover_image_idx" ON "posts" USING btree ("cover_image_id");
  CREATE INDEX "posts_featured_idx" ON "posts" USING btree ("featured");
  CREATE INDEX "posts_show_on_home_idx" ON "posts" USING btree ("show_on_home");
  CREATE INDEX "posts_seo_seo_image_idx" ON "posts" USING btree ("seo_image_id");
  CREATE INDEX "posts_updated_at_idx" ON "posts" USING btree ("updated_at");
  CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at");
  CREATE INDEX "posts_title_idx" ON "posts_locales" USING btree ("title","_locale");
  CREATE UNIQUE INDEX "posts_locales_locale_parent_id_unique" ON "posts_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "posts_rels_order_idx" ON "posts_rels" USING btree ("order");
  CREATE INDEX "posts_rels_parent_idx" ON "posts_rels" USING btree ("parent_id");
  CREATE INDEX "posts_rels_path_idx" ON "posts_rels" USING btree ("path");
  CREATE INDEX "posts_rels_projects_id_idx" ON "posts_rels" USING btree ("projects_id");
  CREATE INDEX "_posts_v_version_tags_order_idx" ON "_posts_v_version_tags" USING btree ("_order");
  CREATE INDEX "_posts_v_version_tags_parent_id_idx" ON "_posts_v_version_tags" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_posts_v_version_tags_locales_locale_parent_id_unique" ON "_posts_v_version_tags_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_posts_v_parent_idx" ON "_posts_v" USING btree ("parent_id");
  CREATE INDEX "_posts_v_version_version_slug_idx" ON "_posts_v" USING btree ("version_slug");
  CREATE INDEX "_posts_v_version_version_published_at_idx" ON "_posts_v" USING btree ("version_published_at");
  CREATE INDEX "_posts_v_version_version_category_idx" ON "_posts_v" USING btree ("version_category");
  CREATE INDEX "_posts_v_version_version_post_category_idx" ON "_posts_v" USING btree ("version_post_category_id");
  CREATE INDEX "_posts_v_version_version_preview_image_idx" ON "_posts_v" USING btree ("version_preview_image_id");
  CREATE INDEX "_posts_v_version_version_cover_image_idx" ON "_posts_v" USING btree ("version_cover_image_id");
  CREATE INDEX "_posts_v_version_version_featured_idx" ON "_posts_v" USING btree ("version_featured");
  CREATE INDEX "_posts_v_version_version_show_on_home_idx" ON "_posts_v" USING btree ("version_show_on_home");
  CREATE INDEX "_posts_v_version_seo_version_seo_image_idx" ON "_posts_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_posts_v_version_version_updated_at_idx" ON "_posts_v" USING btree ("version_updated_at");
  CREATE INDEX "_posts_v_version_version_created_at_idx" ON "_posts_v" USING btree ("version_created_at");
  CREATE INDEX "_posts_v_created_at_idx" ON "_posts_v" USING btree ("created_at");
  CREATE INDEX "_posts_v_updated_at_idx" ON "_posts_v" USING btree ("updated_at");
  CREATE INDEX "_posts_v_version_version_title_idx" ON "_posts_v_locales" USING btree ("version_title","_locale");
  CREATE UNIQUE INDEX "_posts_v_locales_locale_parent_id_unique" ON "_posts_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_posts_v_rels_order_idx" ON "_posts_v_rels" USING btree ("order");
  CREATE INDEX "_posts_v_rels_parent_idx" ON "_posts_v_rels" USING btree ("parent_id");
  CREATE INDEX "_posts_v_rels_path_idx" ON "_posts_v_rels" USING btree ("path");
  CREATE INDEX "_posts_v_rels_projects_id_idx" ON "_posts_v_rels" USING btree ("projects_id");
  CREATE INDEX "open_source_featured_idx" ON "open_source" USING btree ("featured");
  CREATE INDEX "open_source_order_idx" ON "open_source" USING btree ("order");
  CREATE INDEX "open_source_updated_at_idx" ON "open_source" USING btree ("updated_at");
  CREATE INDEX "open_source_created_at_idx" ON "open_source" USING btree ("created_at");
  CREATE INDEX "open_source_name_idx" ON "open_source_locales" USING btree ("name","_locale");
  CREATE UNIQUE INDEX "open_source_locales_locale_parent_id_unique" ON "open_source_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_open_source_v_parent_idx" ON "_open_source_v" USING btree ("parent_id");
  CREATE INDEX "_open_source_v_version_version_featured_idx" ON "_open_source_v" USING btree ("version_featured");
  CREATE INDEX "_open_source_v_version_version_order_idx" ON "_open_source_v" USING btree ("version_order");
  CREATE INDEX "_open_source_v_version_version_updated_at_idx" ON "_open_source_v" USING btree ("version_updated_at");
  CREATE INDEX "_open_source_v_version_version_created_at_idx" ON "_open_source_v" USING btree ("version_created_at");
  CREATE INDEX "_open_source_v_created_at_idx" ON "_open_source_v" USING btree ("created_at");
  CREATE INDEX "_open_source_v_updated_at_idx" ON "_open_source_v" USING btree ("updated_at");
  CREATE INDEX "_open_source_v_version_version_name_idx" ON "_open_source_v_locales" USING btree ("version_name","_locale");
  CREATE UNIQUE INDEX "_open_source_v_locales_locale_parent_id_unique" ON "_open_source_v_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_projects_id_idx" ON "payload_locked_documents_rels" USING btree ("projects_id");
  CREATE INDEX "payload_locked_documents_rels_post_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("post_categories_id");
  CREATE INDEX "payload_locked_documents_rels_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("posts_id");
  CREATE INDEX "payload_locked_documents_rels_open_source_id_idx" ON "payload_locked_documents_rels" USING btree ("open_source_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "site_settings_selected_work_order_idx" ON "site_settings_selected_work" USING btree ("_order");
  CREATE INDEX "site_settings_selected_work_parent_id_idx" ON "site_settings_selected_work" USING btree ("_parent_id");
  CREATE INDEX "site_settings_selected_work_post_idx" ON "site_settings_selected_work" USING btree ("post_id");
  CREATE UNIQUE INDEX "site_settings_selected_work_locales_locale_parent_id_unique" ON "site_settings_selected_work_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "site_settings_services_order_idx" ON "site_settings_services" USING btree ("_order");
  CREATE INDEX "site_settings_services_parent_id_idx" ON "site_settings_services" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "site_settings_services_locales_locale_parent_id_unique" ON "site_settings_services_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "site_settings_seo_seo_default_image_idx" ON "site_settings" USING btree ("seo_default_image_id");
  CREATE UNIQUE INDEX "site_settings_locales_locale_parent_id_unique" ON "site_settings_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "cv_expertise_order_idx" ON "cv_expertise" USING btree ("_order");
  CREATE INDEX "cv_expertise_parent_id_idx" ON "cv_expertise" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "cv_expertise_locales_locale_parent_id_unique" ON "cv_expertise_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "cv_experience_highlights_order_idx" ON "cv_experience_highlights" USING btree ("_order");
  CREATE INDEX "cv_experience_highlights_parent_id_idx" ON "cv_experience_highlights" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "cv_experience_highlights_locales_locale_parent_id_unique" ON "cv_experience_highlights_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "cv_experience_order_idx" ON "cv_experience" USING btree ("_order");
  CREATE INDEX "cv_experience_parent_id_idx" ON "cv_experience" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "cv_experience_locales_locale_parent_id_unique" ON "cv_experience_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "cv_skills_items_order_idx" ON "cv_skills_items" USING btree ("_order");
  CREATE INDEX "cv_skills_items_parent_id_idx" ON "cv_skills_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "cv_skills_items_locales_locale_parent_id_unique" ON "cv_skills_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "cv_skills_order_idx" ON "cv_skills" USING btree ("_order");
  CREATE INDEX "cv_skills_parent_id_idx" ON "cv_skills" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "cv_skills_locales_locale_parent_id_unique" ON "cv_skills_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "cv_education_order_idx" ON "cv_education" USING btree ("_order");
  CREATE INDEX "cv_education_parent_id_idx" ON "cv_education" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "cv_education_locales_locale_parent_id_unique" ON "cv_education_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "cv_languages_order_idx" ON "cv_languages" USING btree ("_order");
  CREATE INDEX "cv_languages_parent_id_idx" ON "cv_languages" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "cv_languages_locales_locale_parent_id_unique" ON "cv_languages_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "cv_pdf_idx" ON "cv" USING btree ("pdf_id");
  CREATE UNIQUE INDEX "cv_locales_locale_parent_id_unique" ON "cv_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "media_locales" CASCADE;
  DROP TABLE "projects_related_posts" CASCADE;
  DROP TABLE "projects" CASCADE;
  DROP TABLE "projects_locales" CASCADE;
  DROP TABLE "projects_rels" CASCADE;
  DROP TABLE "_projects_v_version_related_posts" CASCADE;
  DROP TABLE "_projects_v" CASCADE;
  DROP TABLE "_projects_v_locales" CASCADE;
  DROP TABLE "_projects_v_rels" CASCADE;
  DROP TABLE "post_categories" CASCADE;
  DROP TABLE "post_categories_locales" CASCADE;
  DROP TABLE "posts_tags" CASCADE;
  DROP TABLE "posts_tags_locales" CASCADE;
  DROP TABLE "posts" CASCADE;
  DROP TABLE "posts_locales" CASCADE;
  DROP TABLE "posts_rels" CASCADE;
  DROP TABLE "_posts_v_version_tags" CASCADE;
  DROP TABLE "_posts_v_version_tags_locales" CASCADE;
  DROP TABLE "_posts_v" CASCADE;
  DROP TABLE "_posts_v_locales" CASCADE;
  DROP TABLE "_posts_v_rels" CASCADE;
  DROP TABLE "open_source" CASCADE;
  DROP TABLE "open_source_locales" CASCADE;
  DROP TABLE "_open_source_v" CASCADE;
  DROP TABLE "_open_source_v_locales" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "site_settings_selected_work" CASCADE;
  DROP TABLE "site_settings_selected_work_locales" CASCADE;
  DROP TABLE "site_settings_services" CASCADE;
  DROP TABLE "site_settings_services_locales" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "site_settings_locales" CASCADE;
  DROP TABLE "cv_expertise" CASCADE;
  DROP TABLE "cv_expertise_locales" CASCADE;
  DROP TABLE "cv_experience_highlights" CASCADE;
  DROP TABLE "cv_experience_highlights_locales" CASCADE;
  DROP TABLE "cv_experience" CASCADE;
  DROP TABLE "cv_experience_locales" CASCADE;
  DROP TABLE "cv_skills_items" CASCADE;
  DROP TABLE "cv_skills_items_locales" CASCADE;
  DROP TABLE "cv_skills" CASCADE;
  DROP TABLE "cv_skills_locales" CASCADE;
  DROP TABLE "cv_education" CASCADE;
  DROP TABLE "cv_education_locales" CASCADE;
  DROP TABLE "cv_languages" CASCADE;
  DROP TABLE "cv_languages_locales" CASCADE;
  DROP TABLE "cv" CASCADE;
  DROP TABLE "cv_locales" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_projects_status";
  DROP TYPE "public"."enum_projects_type";
  DROP TYPE "public"."enum__projects_v_version_status";
  DROP TYPE "public"."enum__projects_v_version_type";
  DROP TYPE "public"."enum_posts_category";
  DROP TYPE "public"."enum__posts_v_version_category";`)
}
