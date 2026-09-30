import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('fr', 'en');
  CREATE TYPE "public"."enum_stacks_category" AS ENUM('language', 'frontend', 'backend', 'architecture', 'testing', 'devops', 'security', 'ai');
  CREATE TYPE "public"."enum_projects_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__projects_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__projects_v_published_locale" AS ENUM('fr', 'en');
  CREATE TYPE "public"."enum_services_icon" AS ENUM('layers', 'blocks', 'bot', 'cloud', 'shield-check', 'code', 'database', 'rocket', 'cpu', 'workflow', 'globe', 'smartphone');
  CREATE TYPE "public"."enum_services_tint" AS ENUM('amber', 'violet', 'blue', 'teal');
  CREATE TYPE "public"."enum_experiences_kind" AS ENUM('work', 'education');
  CREATE TYPE "public"."enum_messages_topic" AS ENUM('project', 'ai', 'job', 'other');
  CREATE TYPE "public"."enum_messages_locale" AS ENUM('fr', 'en');
  CREATE TYPE "public"."enum_messages_status" AS ENUM('new', 'read', 'archived');
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
  	"reset_password_requested_at" timestamp(3) with time zone,
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
  	"focal_y" numeric,
  	"sizes_thumb_url" varchar,
  	"sizes_thumb_width" numeric,
  	"sizes_thumb_height" numeric,
  	"sizes_thumb_mime_type" varchar,
  	"sizes_thumb_filesize" numeric,
  	"sizes_thumb_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_hero_url" varchar,
  	"sizes_hero_width" numeric,
  	"sizes_hero_height" numeric,
  	"sizes_hero_mime_type" varchar,
  	"sizes_hero_filesize" numeric,
  	"sizes_hero_filename" varchar
  );
  
  CREATE TABLE "media_locales" (
  	"alt" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "stacks" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar,
  	"category" "enum_stacks_category" NOT NULL,
  	"icon_simple_icon_slug" varchar,
  	"icon_upload_id" integer,
  	"featured" boolean DEFAULT false,
  	"order" numeric DEFAULT 100,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "projects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"cover_id" integer,
  	"links_live" varchar,
  	"links_repo" varchar,
  	"links_case_study_url" varchar,
  	"year" numeric,
  	"client" varchar,
  	"featured" boolean DEFAULT false,
  	"order" numeric DEFAULT 100,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_projects_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "projects_locales" (
  	"title" varchar,
  	"tagline" varchar,
  	"summary" varchar,
  	"case_study" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "projects_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer,
  	"stacks_id" integer
  );
  
  CREATE TABLE "_projects_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" varchar,
  	"version_cover_id" integer,
  	"version_links_live" varchar,
  	"version_links_repo" varchar,
  	"version_links_case_study_url" varchar,
  	"version_year" numeric,
  	"version_client" varchar,
  	"version_featured" boolean DEFAULT false,
  	"version_order" numeric DEFAULT 100,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__projects_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__projects_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_projects_v_locales" (
  	"version_title" varchar,
  	"version_tagline" varchar,
  	"version_summary" varchar,
  	"version_case_study" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_projects_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer,
  	"stacks_id" integer
  );
  
  CREATE TABLE "services" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" "enum_services_icon" DEFAULT 'layers' NOT NULL,
  	"tint" "enum_services_tint" DEFAULT 'violet' NOT NULL,
  	"order" numeric DEFAULT 100,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "services_locales" (
  	"title" varchar NOT NULL,
  	"description" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "experiences_highlights" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "experiences_highlights_locales" (
  	"text" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "experiences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"kind" "enum_experiences_kind" DEFAULT 'work' NOT NULL,
  	"organization" varchar NOT NULL,
  	"location" varchar,
  	"start" timestamp(3) with time zone NOT NULL,
  	"end" timestamp(3) with time zone,
  	"order" numeric DEFAULT 100,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "experiences_locales" (
  	"role" varchar NOT NULL,
  	"summary" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "experiences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"stacks_id" integer
  );
  
  CREATE TABLE "messages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"topic" "enum_messages_topic" NOT NULL,
  	"message" varchar NOT NULL,
  	"ip_hash" varchar,
  	"locale" "enum_messages_locale",
  	"status" "enum_messages_status" DEFAULT 'new',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
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
  	"stacks_id" integer,
  	"projects_id" integer,
  	"services_id" integer,
  	"experiences_id" integer,
  	"messages_id" integer
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
  
  CREATE TABLE "site_hero_rotating_titles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "site_hero_rotating_titles_locales" (
  	"text" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "site_hero_chips" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "site_hero_chips_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "site_hero_trusted_by" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"url" varchar
  );
  
  CREATE TABLE "site_about_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "site_about_stats_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "site_process_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "site_process_steps_locales" (
  	"title" varchar NOT NULL,
  	"text" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "site" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"identity_name" varchar DEFAULT 'Denis Bucspun' NOT NULL,
  	"identity_location" varchar,
  	"about_auto_stats" boolean DEFAULT true,
  	"contact_email" varchar,
  	"contact_phone" varchar,
  	"contact_show_phone" boolean DEFAULT false,
  	"contact_linkedin" varchar,
  	"contact_github" varchar,
  	"contact_contact_to" varchar,
  	"cv_cv_fullstack_id" integer,
  	"cv_cv_ai_id" integer,
  	"seo_og_image_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "site_locales" (
  	"identity_job_title" varchar NOT NULL,
  	"identity_tagline" varchar,
  	"hero_eyebrow" varchar,
  	"hero_cta_primary" varchar,
  	"hero_cta_secondary" varchar,
  	"hero_trusted_by_title" varchar,
  	"about_headline" varchar,
  	"about_bio" varchar,
  	"process_headline" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "cinematic" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"avatar_model_id" integer,
  	"avatar_portrait_id" integer,
  	"hero_poster_id" integer,
  	"hero_video_desktop_mp4_id" integer,
  	"hero_video_desktop_webm_id" integer,
  	"hero_video_mobile_mp4_id" integer,
  	"hero_video_mobile_webm_id" integer,
  	"scrub_video_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_locales" ADD CONSTRAINT "media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "stacks" ADD CONSTRAINT "stacks_icon_upload_id_media_id_fk" FOREIGN KEY ("icon_upload_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_locales" ADD CONSTRAINT "projects_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_rels" ADD CONSTRAINT "projects_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_rels" ADD CONSTRAINT "projects_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_rels" ADD CONSTRAINT "projects_rels_stacks_fk" FOREIGN KEY ("stacks_id") REFERENCES "public"."stacks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_parent_id_projects_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_cover_id_media_id_fk" FOREIGN KEY ("version_cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_locales" ADD CONSTRAINT "_projects_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_rels" ADD CONSTRAINT "_projects_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_rels" ADD CONSTRAINT "_projects_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_rels" ADD CONSTRAINT "_projects_v_rels_stacks_fk" FOREIGN KEY ("stacks_id") REFERENCES "public"."stacks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_locales" ADD CONSTRAINT "services_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "experiences_highlights" ADD CONSTRAINT "experiences_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."experiences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "experiences_highlights_locales" ADD CONSTRAINT "experiences_highlights_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."experiences_highlights"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "experiences_locales" ADD CONSTRAINT "experiences_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."experiences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "experiences_rels" ADD CONSTRAINT "experiences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."experiences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "experiences_rels" ADD CONSTRAINT "experiences_rels_stacks_fk" FOREIGN KEY ("stacks_id") REFERENCES "public"."stacks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_stacks_fk" FOREIGN KEY ("stacks_id") REFERENCES "public"."stacks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_experiences_fk" FOREIGN KEY ("experiences_id") REFERENCES "public"."experiences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_messages_fk" FOREIGN KEY ("messages_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_hero_rotating_titles" ADD CONSTRAINT "site_hero_rotating_titles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_hero_rotating_titles_locales" ADD CONSTRAINT "site_hero_rotating_titles_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_hero_rotating_titles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_hero_chips" ADD CONSTRAINT "site_hero_chips_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_hero_chips_locales" ADD CONSTRAINT "site_hero_chips_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_hero_chips"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_hero_trusted_by" ADD CONSTRAINT "site_hero_trusted_by_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_about_stats" ADD CONSTRAINT "site_about_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_about_stats_locales" ADD CONSTRAINT "site_about_stats_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_about_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_process_steps" ADD CONSTRAINT "site_process_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_process_steps_locales" ADD CONSTRAINT "site_process_steps_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_process_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site" ADD CONSTRAINT "site_cv_cv_fullstack_id_media_id_fk" FOREIGN KEY ("cv_cv_fullstack_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site" ADD CONSTRAINT "site_cv_cv_ai_id_media_id_fk" FOREIGN KEY ("cv_cv_ai_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site" ADD CONSTRAINT "site_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_locales" ADD CONSTRAINT "site_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cinematic" ADD CONSTRAINT "cinematic_avatar_model_id_media_id_fk" FOREIGN KEY ("avatar_model_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cinematic" ADD CONSTRAINT "cinematic_avatar_portrait_id_media_id_fk" FOREIGN KEY ("avatar_portrait_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cinematic" ADD CONSTRAINT "cinematic_hero_poster_id_media_id_fk" FOREIGN KEY ("hero_poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cinematic" ADD CONSTRAINT "cinematic_hero_video_desktop_mp4_id_media_id_fk" FOREIGN KEY ("hero_video_desktop_mp4_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cinematic" ADD CONSTRAINT "cinematic_hero_video_desktop_webm_id_media_id_fk" FOREIGN KEY ("hero_video_desktop_webm_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cinematic" ADD CONSTRAINT "cinematic_hero_video_mobile_mp4_id_media_id_fk" FOREIGN KEY ("hero_video_mobile_mp4_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cinematic" ADD CONSTRAINT "cinematic_hero_video_mobile_webm_id_media_id_fk" FOREIGN KEY ("hero_video_mobile_webm_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cinematic" ADD CONSTRAINT "cinematic_scrub_video_id_media_id_fk" FOREIGN KEY ("scrub_video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumb_sizes_thumb_filename_idx" ON "media" USING btree ("sizes_thumb_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_hero_sizes_hero_filename_idx" ON "media" USING btree ("sizes_hero_filename");
  CREATE UNIQUE INDEX "media_locales_locale_parent_id_unique" ON "media_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "stacks_slug_idx" ON "stacks" USING btree ("slug");
  CREATE INDEX "stacks_icon_icon_upload_idx" ON "stacks" USING btree ("icon_upload_id");
  CREATE INDEX "stacks_updated_at_idx" ON "stacks" USING btree ("updated_at");
  CREATE INDEX "stacks_created_at_idx" ON "stacks" USING btree ("created_at");
  CREATE UNIQUE INDEX "projects_slug_idx" ON "projects" USING btree ("slug");
  CREATE INDEX "projects_cover_idx" ON "projects" USING btree ("cover_id");
  CREATE INDEX "projects_updated_at_idx" ON "projects" USING btree ("updated_at");
  CREATE INDEX "projects_created_at_idx" ON "projects" USING btree ("created_at");
  CREATE INDEX "projects__status_idx" ON "projects" USING btree ("_status");
  CREATE UNIQUE INDEX "projects_locales_locale_parent_id_unique" ON "projects_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "projects_rels_order_idx" ON "projects_rels" USING btree ("order");
  CREATE INDEX "projects_rels_parent_idx" ON "projects_rels" USING btree ("parent_id");
  CREATE INDEX "projects_rels_path_idx" ON "projects_rels" USING btree ("path");
  CREATE INDEX "projects_rels_media_id_idx" ON "projects_rels" USING btree ("media_id");
  CREATE INDEX "projects_rels_stacks_id_idx" ON "projects_rels" USING btree ("stacks_id");
  CREATE INDEX "_projects_v_parent_idx" ON "_projects_v" USING btree ("parent_id");
  CREATE INDEX "_projects_v_version_version_slug_idx" ON "_projects_v" USING btree ("version_slug");
  CREATE INDEX "_projects_v_version_version_cover_idx" ON "_projects_v" USING btree ("version_cover_id");
  CREATE INDEX "_projects_v_version_version_updated_at_idx" ON "_projects_v" USING btree ("version_updated_at");
  CREATE INDEX "_projects_v_version_version_created_at_idx" ON "_projects_v" USING btree ("version_created_at");
  CREATE INDEX "_projects_v_version_version__status_idx" ON "_projects_v" USING btree ("version__status");
  CREATE INDEX "_projects_v_created_at_idx" ON "_projects_v" USING btree ("created_at");
  CREATE INDEX "_projects_v_updated_at_idx" ON "_projects_v" USING btree ("updated_at");
  CREATE INDEX "_projects_v_snapshot_idx" ON "_projects_v" USING btree ("snapshot");
  CREATE INDEX "_projects_v_published_locale_idx" ON "_projects_v" USING btree ("published_locale");
  CREATE INDEX "_projects_v_latest_idx" ON "_projects_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_projects_v_locales_locale_parent_id_unique" ON "_projects_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_projects_v_rels_order_idx" ON "_projects_v_rels" USING btree ("order");
  CREATE INDEX "_projects_v_rels_parent_idx" ON "_projects_v_rels" USING btree ("parent_id");
  CREATE INDEX "_projects_v_rels_path_idx" ON "_projects_v_rels" USING btree ("path");
  CREATE INDEX "_projects_v_rels_media_id_idx" ON "_projects_v_rels" USING btree ("media_id");
  CREATE INDEX "_projects_v_rels_stacks_id_idx" ON "_projects_v_rels" USING btree ("stacks_id");
  CREATE INDEX "services_updated_at_idx" ON "services" USING btree ("updated_at");
  CREATE INDEX "services_created_at_idx" ON "services" USING btree ("created_at");
  CREATE UNIQUE INDEX "services_locales_locale_parent_id_unique" ON "services_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "experiences_highlights_order_idx" ON "experiences_highlights" USING btree ("_order");
  CREATE INDEX "experiences_highlights_parent_id_idx" ON "experiences_highlights" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "experiences_highlights_locales_locale_parent_id_unique" ON "experiences_highlights_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "experiences_updated_at_idx" ON "experiences" USING btree ("updated_at");
  CREATE INDEX "experiences_created_at_idx" ON "experiences" USING btree ("created_at");
  CREATE UNIQUE INDEX "experiences_locales_locale_parent_id_unique" ON "experiences_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "experiences_rels_order_idx" ON "experiences_rels" USING btree ("order");
  CREATE INDEX "experiences_rels_parent_idx" ON "experiences_rels" USING btree ("parent_id");
  CREATE INDEX "experiences_rels_path_idx" ON "experiences_rels" USING btree ("path");
  CREATE INDEX "experiences_rels_stacks_id_idx" ON "experiences_rels" USING btree ("stacks_id");
  CREATE INDEX "messages_ip_hash_idx" ON "messages" USING btree ("ip_hash");
  CREATE INDEX "messages_updated_at_idx" ON "messages" USING btree ("updated_at");
  CREATE INDEX "messages_created_at_idx" ON "messages" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_stacks_id_idx" ON "payload_locked_documents_rels" USING btree ("stacks_id");
  CREATE INDEX "payload_locked_documents_rels_projects_id_idx" ON "payload_locked_documents_rels" USING btree ("projects_id");
  CREATE INDEX "payload_locked_documents_rels_services_id_idx" ON "payload_locked_documents_rels" USING btree ("services_id");
  CREATE INDEX "payload_locked_documents_rels_experiences_id_idx" ON "payload_locked_documents_rels" USING btree ("experiences_id");
  CREATE INDEX "payload_locked_documents_rels_messages_id_idx" ON "payload_locked_documents_rels" USING btree ("messages_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "site_hero_rotating_titles_order_idx" ON "site_hero_rotating_titles" USING btree ("_order");
  CREATE INDEX "site_hero_rotating_titles_parent_id_idx" ON "site_hero_rotating_titles" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "site_hero_rotating_titles_locales_locale_parent_id_unique" ON "site_hero_rotating_titles_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "site_hero_chips_order_idx" ON "site_hero_chips" USING btree ("_order");
  CREATE INDEX "site_hero_chips_parent_id_idx" ON "site_hero_chips" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "site_hero_chips_locales_locale_parent_id_unique" ON "site_hero_chips_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "site_hero_trusted_by_order_idx" ON "site_hero_trusted_by" USING btree ("_order");
  CREATE INDEX "site_hero_trusted_by_parent_id_idx" ON "site_hero_trusted_by" USING btree ("_parent_id");
  CREATE INDEX "site_about_stats_order_idx" ON "site_about_stats" USING btree ("_order");
  CREATE INDEX "site_about_stats_parent_id_idx" ON "site_about_stats" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "site_about_stats_locales_locale_parent_id_unique" ON "site_about_stats_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "site_process_steps_order_idx" ON "site_process_steps" USING btree ("_order");
  CREATE INDEX "site_process_steps_parent_id_idx" ON "site_process_steps" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "site_process_steps_locales_locale_parent_id_unique" ON "site_process_steps_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "site_cv_cv_cv_fullstack_idx" ON "site" USING btree ("cv_cv_fullstack_id");
  CREATE INDEX "site_cv_cv_cv_ai_idx" ON "site" USING btree ("cv_cv_ai_id");
  CREATE INDEX "site_seo_seo_og_image_idx" ON "site" USING btree ("seo_og_image_id");
  CREATE UNIQUE INDEX "site_locales_locale_parent_id_unique" ON "site_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "cinematic_avatar_model_idx" ON "cinematic" USING btree ("avatar_model_id");
  CREATE INDEX "cinematic_avatar_portrait_idx" ON "cinematic" USING btree ("avatar_portrait_id");
  CREATE INDEX "cinematic_hero_poster_idx" ON "cinematic" USING btree ("hero_poster_id");
  CREATE INDEX "cinematic_hero_video_desktop_hero_video_desktop_mp4_idx" ON "cinematic" USING btree ("hero_video_desktop_mp4_id");
  CREATE INDEX "cinematic_hero_video_desktop_hero_video_desktop_webm_idx" ON "cinematic" USING btree ("hero_video_desktop_webm_id");
  CREATE INDEX "cinematic_hero_video_mobile_hero_video_mobile_mp4_idx" ON "cinematic" USING btree ("hero_video_mobile_mp4_id");
  CREATE INDEX "cinematic_hero_video_mobile_hero_video_mobile_webm_idx" ON "cinematic" USING btree ("hero_video_mobile_webm_id");
  CREATE INDEX "cinematic_scrub_video_idx" ON "cinematic" USING btree ("scrub_video_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "media_locales" CASCADE;
  DROP TABLE "stacks" CASCADE;
  DROP TABLE "projects" CASCADE;
  DROP TABLE "projects_locales" CASCADE;
  DROP TABLE "projects_rels" CASCADE;
  DROP TABLE "_projects_v" CASCADE;
  DROP TABLE "_projects_v_locales" CASCADE;
  DROP TABLE "_projects_v_rels" CASCADE;
  DROP TABLE "services" CASCADE;
  DROP TABLE "services_locales" CASCADE;
  DROP TABLE "experiences_highlights" CASCADE;
  DROP TABLE "experiences_highlights_locales" CASCADE;
  DROP TABLE "experiences" CASCADE;
  DROP TABLE "experiences_locales" CASCADE;
  DROP TABLE "experiences_rels" CASCADE;
  DROP TABLE "messages" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "site_hero_rotating_titles" CASCADE;
  DROP TABLE "site_hero_rotating_titles_locales" CASCADE;
  DROP TABLE "site_hero_chips" CASCADE;
  DROP TABLE "site_hero_chips_locales" CASCADE;
  DROP TABLE "site_hero_trusted_by" CASCADE;
  DROP TABLE "site_about_stats" CASCADE;
  DROP TABLE "site_about_stats_locales" CASCADE;
  DROP TABLE "site_process_steps" CASCADE;
  DROP TABLE "site_process_steps_locales" CASCADE;
  DROP TABLE "site" CASCADE;
  DROP TABLE "site_locales" CASCADE;
  DROP TABLE "cinematic" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_stacks_category";
  DROP TYPE "public"."enum_projects_status";
  DROP TYPE "public"."enum__projects_v_version_status";
  DROP TYPE "public"."enum__projects_v_published_locale";
  DROP TYPE "public"."enum_services_icon";
  DROP TYPE "public"."enum_services_tint";
  DROP TYPE "public"."enum_experiences_kind";
  DROP TYPE "public"."enum_messages_topic";
  DROP TYPE "public"."enum_messages_locale";
  DROP TYPE "public"."enum_messages_status";`)
}
