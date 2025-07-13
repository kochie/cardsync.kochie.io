-- Add Instagram connection and contact tables
-- Migration: 20250101000000_add_instagram_tables.sql

-- Instagram connections table
CREATE TABLE IF NOT EXISTS "public"."instagram_connections" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "name" "text" NOT NULL,
    "cookies" "text" NOT NULL,
    "session_id" "text" NOT NULL,
    "username" "text" NOT NULL,
    "follower_count" bigint DEFAULT '0'::bigint NOT NULL,
    "following_count" bigint DEFAULT '0'::bigint NOT NULL,
    "last_synced" timestamp with time zone,
    "status" "text" DEFAULT 'connected'::"text" NOT NULL,
    "sync_frequency" "text" DEFAULT 'manual'::"text" NOT NULL
);

-- Instagram contacts table
CREATE TABLE IF NOT EXISTS "public"."instagram_contacts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"(),
    "connection_id" "uuid" NOT NULL,
    "user_id_instagram" "text" NOT NULL,
    "username" "text" NOT NULL,
    "full_name" "text",
    "profile_picture" "text",
    "is_private" boolean DEFAULT false NOT NULL,
    "is_verified" boolean DEFAULT false NOT NULL,
    "follower_count" bigint DEFAULT '0'::bigint NOT NULL,
    "following_count" bigint DEFAULT '0'::bigint NOT NULL,
    "mutual_followers" "text"[] DEFAULT '{}'::text[] NOT NULL,
    "followed_by_viewer" boolean DEFAULT false NOT NULL,
    "follows_viewer" boolean DEFAULT false NOT NULL,
    "requested_by_viewer" boolean DEFAULT false NOT NULL,
    "last_synced" timestamp with time zone
);

-- Primary keys
ALTER TABLE ONLY "public"."instagram_connections"
    ADD CONSTRAINT "instagram_connections_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."instagram_contacts"
    ADD CONSTRAINT "instagram_contacts_pkey" PRIMARY KEY ("id");

-- Foreign key constraints
ALTER TABLE ONLY "public"."instagram_connections"
    ADD CONSTRAINT "instagram_connections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");

ALTER TABLE ONLY "public"."instagram_contacts"
    ADD CONSTRAINT "instagram_contacts_connection_id_fkey" FOREIGN KEY ("connection_id") REFERENCES "public"."instagram_connections"("id");

ALTER TABLE ONLY "public"."instagram_contacts"
    ADD CONSTRAINT "instagram_contacts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");

-- Add Instagram contact reference to carddav_contacts
ALTER TABLE "public"."carddav_contacts" 
ADD COLUMN IF NOT EXISTS "instagram_contact" "uuid";

-- Foreign key for Instagram contact reference
ALTER TABLE ONLY "public"."carddav_contacts"
    ADD CONSTRAINT "carddav_contacts_instagram_contact_fkey" FOREIGN KEY ("instagram_contact") REFERENCES "public"."instagram_contacts"("id");

-- Row Level Security (RLS) policies for Instagram connections
CREATE POLICY "Enable insert for authenticated users only" ON "public"."instagram_connections" 
FOR INSERT TO "authenticated" WITH CHECK (true);

CREATE POLICY "Enable insert for users based on user_id" ON "public"."instagram_connections" 
FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));

CREATE POLICY "Enable update for users based on user_id" ON "public"."instagram_connections" 
FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));

CREATE POLICY "Enable users to view their own data only" ON "public"."instagram_connections" 
FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));

CREATE POLICY "Enable users to delete their own data only" ON "public"."instagram_connections" 
FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));

-- Row Level Security (RLS) policies for Instagram contacts
CREATE POLICY "Enable insert for authenticated users only" ON "public"."instagram_contacts" 
FOR INSERT TO "authenticated" WITH CHECK (true);

CREATE POLICY "Enable insert for users based on user_id" ON "public"."instagram_contacts" 
FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));

CREATE POLICY "Enable update for users based on user_id" ON "public"."instagram_contacts" 
FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));

CREATE POLICY "Enable users to view their own data only" ON "public"."instagram_contacts" 
FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));

CREATE POLICY "Enable users to delete their own data only" ON "public"."instagram_contacts" 
FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));

-- Enable RLS on tables
ALTER TABLE "public"."instagram_connections" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."instagram_contacts" ENABLE ROW LEVEL SECURITY;

-- Create function to match Instagram contacts by username
CREATE OR REPLACE FUNCTION "public"."match_instagram_by_username"() RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$declare
  updated_count integer;
begin
  update carddav_contacts
  set 
    instagram_contact = instagram_contacts.id,
    last_updated = now()
  from instagram_contacts
  where carddav_contacts.instagram_contact is null
    and lower(carddav_contacts.name) = lower(instagram_contacts.full_name)
    and carddav_contacts.user_id = instagram_contacts.user_id;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  return updated_count;
end;$$;

-- Grant ownership
ALTER FUNCTION "public"."match_instagram_by_username"() OWNER TO "postgres";

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "instagram_connections_user_id_idx" ON "public"."instagram_connections" ("user_id");
CREATE INDEX IF NOT EXISTS "instagram_connections_username_idx" ON "public"."instagram_connections" ("username");
CREATE INDEX IF NOT EXISTS "instagram_contacts_connection_id_idx" ON "public"."instagram_contacts" ("connection_id");
CREATE INDEX IF NOT EXISTS "instagram_contacts_user_id_idx" ON "public"."instagram_contacts" ("user_id");
CREATE INDEX IF NOT EXISTS "instagram_contacts_username_idx" ON "public"."instagram_contacts" ("username");
CREATE INDEX IF NOT EXISTS "instagram_contacts_user_id_instagram_idx" ON "public"."instagram_contacts" ("user_id_instagram");

-- Add comments for documentation
COMMENT ON TABLE "public"."instagram_connections" IS 'Instagram connection configurations for users';
COMMENT ON TABLE "public"."instagram_contacts" IS 'Instagram followers/following contacts';
COMMENT ON COLUMN "public"."instagram_connections"."cookies" IS 'Encrypted Instagram session cookies';
COMMENT ON COLUMN "public"."instagram_connections"."session_id" IS 'Instagram session ID for API requests';
COMMENT ON COLUMN "public"."instagram_contacts"."user_id_instagram" IS 'Instagram internal user ID';
COMMENT ON COLUMN "public"."instagram_contacts"."mutual_followers" IS 'Array of usernames who are mutual followers'; 