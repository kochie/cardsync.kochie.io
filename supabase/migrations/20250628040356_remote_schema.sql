

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."match_linkedin_by_name"() RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$declare
  updated_count integer;
begin
  update carddav_contacts
  set 
    linkedin_contact = linkedin_contacts.entity_urn,
    last_updated = now()
  from linkedin_contacts
  where carddav_contacts.linkedin_contact is null
    and lower(carddav_contacts.name) = lower(linkedin_contacts.full_name);

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  return updated_count;
end;$$;


ALTER FUNCTION "public"."match_linkedin_by_name"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."carddav_addressbooks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "display_name" "text",
    "url" "text" NOT NULL,
    "connection_id" "uuid" NOT NULL
);


ALTER TABLE "public"."carddav_addressbooks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."carddav_connections" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"(),
    "description" "text" DEFAULT ''::"text" NOT NULL,
    "username" "text" DEFAULT ''::"text" NOT NULL,
    "password" "text" DEFAULT ''::"text" NOT NULL,
    "name" "text" DEFAULT ''::"text" NOT NULL,
    "server" "text" DEFAULT ''::"text" NOT NULL,
    "use_ssl" boolean DEFAULT true NOT NULL,
    "sync_all_contacts" boolean DEFAULT true NOT NULL,
    "sync_frequency" "text" DEFAULT 'hour'::"text" NOT NULL,
    "sync_groups" boolean DEFAULT true NOT NULL,
    "sync_photos" boolean DEFAULT true NOT NULL,
    "address_book_path" "text" DEFAULT ''::"text" NOT NULL,
    "contact_count" bigint DEFAULT '0'::bigint NOT NULL,
    "status" "text" DEFAULT 'connected'::"text" NOT NULL,
    "last_synced" timestamp with time zone
);


ALTER TABLE "public"."carddav_connections" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."carddav_contacts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text",
    "company" "text",
    "title" "text",
    "role" "text",
    "user_id" "uuid" DEFAULT "auth"."uid"(),
    "emails" "text"[] NOT NULL,
    "addresses" "text"[] NOT NULL,
    "phones" "text"[] NOT NULL,
    "linkedin_contact" "text",
    "last_updated" timestamp with time zone NOT NULL,
    "photo_blur_url" "text",
    "address_book" "uuid" NOT NULL,
    "id_is_uppercase" boolean,
    "birth_date" "date"
);


ALTER TABLE "public"."carddav_contacts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."carddav_group_members" (
    "member_id" "uuid" NOT NULL,
    "address_book" "uuid" NOT NULL,
    "group_id" "uuid" NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL
);


ALTER TABLE "public"."carddav_group_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."carddav_groups" (
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text",
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "readonly" boolean DEFAULT false NOT NULL,
    "address_book" "uuid" NOT NULL,
    "id_is_uppercase" boolean NOT NULL,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "description" "text",
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL
);


ALTER TABLE "public"."carddav_groups" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."linkedin_connections" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "session_id" "text" NOT NULL,
    "cookies" "text" NOT NULL,
    "name" "text" NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "number_contacts" bigint DEFAULT '0'::bigint NOT NULL,
    "last_synced" timestamp with time zone,
    "status" "text",
    "sync_frequency" "text"
);


ALTER TABLE "public"."linkedin_connections" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."linkedin_contacts" (
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "public_identifier" "text",
    "entity_urn" "text" NOT NULL,
    "first_name" "text",
    "last_name" "text",
    "headline" "text",
    "full_name" "text",
    "profile_picture" "text",
    "user_id" "uuid" DEFAULT "auth"."uid"(),
    "connection_id" "uuid" NOT NULL,
    "last_synced" timestamp with time zone,
    "birth_date" "date",
    "phone_numbers" "text"[],
    "addresses" "text"[],
    "websites" "text"[],
    "emails" "text"[]
);


ALTER TABLE "public"."linkedin_contacts" OWNER TO "postgres";


ALTER TABLE ONLY "public"."carddav_addressbooks"
    ADD CONSTRAINT "carddav_addressbooks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."carddav_addressbooks"
    ADD CONSTRAINT "carddav_addressbooks_url_connection_id_unique" UNIQUE ("url", "connection_id");



ALTER TABLE ONLY "public"."carddav_connections"
    ADD CONSTRAINT "carddav_connections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."carddav_contacts"
    ADD CONSTRAINT "carddav_contacts_pkey" PRIMARY KEY ("id", "address_book");



ALTER TABLE ONLY "public"."carddav_group_members"
    ADD CONSTRAINT "carddav_group_members_pkey" PRIMARY KEY ("member_id", "address_book", "group_id");



ALTER TABLE ONLY "public"."carddav_groups"
    ADD CONSTRAINT "groups_id_key" UNIQUE ("id");



ALTER TABLE ONLY "public"."carddav_groups"
    ADD CONSTRAINT "groups_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."linkedin_connections"
    ADD CONSTRAINT "linkedin_connections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."linkedin_contacts"
    ADD CONSTRAINT "linkedin_contacts_pkey" PRIMARY KEY ("entity_urn");



ALTER TABLE ONLY "public"."carddav_addressbooks"
    ADD CONSTRAINT "carddav_addressbooks_connection_id_fkey" FOREIGN KEY ("connection_id") REFERENCES "public"."carddav_connections"("id");



ALTER TABLE ONLY "public"."carddav_addressbooks"
    ADD CONSTRAINT "carddav_addressbooks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."carddav_connections"
    ADD CONSTRAINT "carddav_connections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."carddav_contacts"
    ADD CONSTRAINT "carddav_contacts_address_book_fkey" FOREIGN KEY ("address_book") REFERENCES "public"."carddav_addressbooks"("id");



ALTER TABLE ONLY "public"."carddav_group_members"
    ADD CONSTRAINT "carddav_group_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."carddav_groups"
    ADD CONSTRAINT "carddav_groups_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."carddav_contacts"
    ADD CONSTRAINT "contacts_linkedin_contact_fkey" FOREIGN KEY ("linkedin_contact") REFERENCES "public"."linkedin_contacts"("entity_urn");



ALTER TABLE ONLY "public"."carddav_contacts"
    ADD CONSTRAINT "contacts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."carddav_group_members"
    ADD CONSTRAINT "group_members_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."carddav_groups"("id");



ALTER TABLE ONLY "public"."carddav_group_members"
    ADD CONSTRAINT "group_members_member_id_address_book_fkey" FOREIGN KEY ("member_id", "address_book") REFERENCES "public"."carddav_contacts"("id", "address_book");



ALTER TABLE ONLY "public"."carddav_groups"
    ADD CONSTRAINT "groups_address_book_fkey" FOREIGN KEY ("address_book") REFERENCES "public"."carddav_addressbooks"("id");



ALTER TABLE ONLY "public"."linkedin_connections"
    ADD CONSTRAINT "linkedin_connections_userId_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."linkedin_contacts"
    ADD CONSTRAINT "linkedin_contacts_connection_id_fkey" FOREIGN KEY ("connection_id") REFERENCES "public"."linkedin_connections"("id");



ALTER TABLE ONLY "public"."linkedin_contacts"
    ADD CONSTRAINT "linkedin_contacts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



CREATE POLICY "Enable insert for authenticated users only" ON "public"."carddav_connections" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."carddav_contacts" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."carddav_groups" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."linkedin_connections" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."linkedin_contacts" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for users based on user_id" ON "public"."carddav_addressbooks" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable insert for users based on user_id" ON "public"."carddav_connections" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable insert for users based on user_id" ON "public"."carddav_contacts" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable insert for users based on user_id" ON "public"."carddav_group_members" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable insert for users based on user_id" ON "public"."carddav_groups" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable insert for users based on user_id" ON "public"."linkedin_connections" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable insert for users based on user_id" ON "public"."linkedin_contacts" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable update for users based on email" ON "public"."carddav_addressbooks" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable update for users based on email" ON "public"."carddav_group_members" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable update for users based on email" ON "public"."carddav_groups" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable update for users based on email" ON "public"."linkedin_contacts" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable update for users based on user_id" ON "public"."carddav_connections" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable update for users based on user_id" ON "public"."carddav_contacts" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable users to view their own data only" ON "public"."carddav_addressbooks" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable users to view their own data only" ON "public"."carddav_connections" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable users to view their own data only" ON "public"."carddav_contacts" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable users to view their own data only" ON "public"."carddav_group_members" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable users to view their own data only" ON "public"."carddav_groups" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable users to view their own data only" ON "public"."linkedin_connections" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable users to view their own data only" ON "public"."linkedin_contacts" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."carddav_addressbooks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."carddav_connections" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."carddav_contacts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."carddav_group_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."carddav_groups" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."linkedin_connections" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."linkedin_contacts" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."carddav_connections";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































REVOKE ALL ON FUNCTION "public"."match_linkedin_by_name"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."match_linkedin_by_name"() TO "anon";
GRANT ALL ON FUNCTION "public"."match_linkedin_by_name"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."match_linkedin_by_name"() TO "service_role";


















GRANT ALL ON TABLE "public"."carddav_addressbooks" TO "anon";
GRANT ALL ON TABLE "public"."carddav_addressbooks" TO "authenticated";
GRANT ALL ON TABLE "public"."carddav_addressbooks" TO "service_role";



GRANT ALL ON TABLE "public"."carddav_connections" TO "anon";
GRANT ALL ON TABLE "public"."carddav_connections" TO "authenticated";
GRANT ALL ON TABLE "public"."carddav_connections" TO "service_role";



GRANT ALL ON TABLE "public"."carddav_contacts" TO "anon";
GRANT ALL ON TABLE "public"."carddav_contacts" TO "authenticated";
GRANT ALL ON TABLE "public"."carddav_contacts" TO "service_role";



GRANT ALL ON TABLE "public"."carddav_group_members" TO "anon";
GRANT ALL ON TABLE "public"."carddav_group_members" TO "authenticated";
GRANT ALL ON TABLE "public"."carddav_group_members" TO "service_role";



GRANT ALL ON TABLE "public"."carddav_groups" TO "anon";
GRANT ALL ON TABLE "public"."carddav_groups" TO "authenticated";
GRANT ALL ON TABLE "public"."carddav_groups" TO "service_role";



GRANT ALL ON TABLE "public"."linkedin_connections" TO "anon";
GRANT ALL ON TABLE "public"."linkedin_connections" TO "authenticated";
GRANT ALL ON TABLE "public"."linkedin_connections" TO "service_role";



GRANT ALL ON TABLE "public"."linkedin_contacts" TO "anon";
GRANT ALL ON TABLE "public"."linkedin_contacts" TO "authenticated";
GRANT ALL ON TABLE "public"."linkedin_contacts" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























RESET ALL;
