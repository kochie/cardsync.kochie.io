import { ConnectionStatus, LinkedinConnection } from "@/models/linkedinContact";
import { linkedinDetectDuplicates } from "@/utils/linkedin/duplicates";
import { getLinkedinConnections } from "@/utils/linkedin/list";
import { uploadConnections } from "@/utils/linkedin/upload";
import { createClient } from "@/utils/supabase/server";
import { getInstagramMutualContacts } from "@/utils/instagram/list";
import { Tables } from "@/types/database.types";
import { SupabaseClient } from "@supabase/supabase-js";

async function syncLinkedinConnection(connectionId: string, supabase: SupabaseClient) {
  const { data, error: queryError } = await supabase
    .from("linkedin_connections")
    .select("*")
    .eq("id", connectionId)
    .single();
  if (queryError) throw queryError;

  const connection = LinkedinConnection.fromDatabaseObject(data);
  if (connection.status === ConnectionStatus.Syncing) {
    throw new Error("Connection is already syncing");
  }

  const { error: updateError } = await supabase
    .from("linkedin_connections")
    .update({ status: ConnectionStatus.Syncing })
    .eq("id", connectionId);
  if (updateError) throw updateError;

  try {
    console.log(`Syncing LinkedIn connections for ${connection.name}...`);
    
    let profileCount = 0;
    const profiles = getLinkedinConnections(connection);
    
    // Process each profile as it's yielded and upload to database
    for await (const profile of profiles) {
      await uploadConnections([profile], connection.id);
      profileCount++;
      
      // Update the connection with current progress
      await supabase
        .from("linkedin_connections")
        .update({ number_contacts: profileCount })
        .eq("id", connectionId);
    }
    
    console.log(`Detecting duplicates for ${connection.name}...`);
    await linkedinDetectDuplicates(connection.id);
    const { error: finalUpdateError } = await supabase
      .from("linkedin_connections")
      .update({
        status: ConnectionStatus.Connected,
        last_synced: new Date().toISOString(),
        number_contacts: profileCount,
      })
      .eq("id", connectionId);
    if (finalUpdateError) throw finalUpdateError;
  } catch (err) {
    await supabase
      .from("linkedin_connections")
      .update({ status: ConnectionStatus.Error })
      .eq("id", connectionId);
    throw err;
  }
}

async function syncInstagramConnection(connectionId: string, supabase: SupabaseClient) {
  const { data, error: queryError } = await supabase
    .from("instagram_connections")
    .select("*")
    .eq("id", connectionId)
    .single();
  if (queryError) throw queryError;
  if (!data) throw new Error("Instagram connection not found");

  if (data.status === ConnectionStatus.Syncing) {
    throw new Error("Connection is already syncing");
  }

  const { error: updateError } = await supabase
    .from("instagram_connections")
    .update({ status: ConnectionStatus.Syncing })
    .eq("id", connectionId);
  if (updateError) throw updateError;

  const connection = {
    id: data.id,
    cookies: data.cookies,
    name: data.name,
    sessionId: data.session_id,
    userId: data.instagram_id, // use the new numeric PK
    username: data.username,
    followerCount: data.follower_count,
    followingCount: data.following_count,
    lastSynced: data.last_synced ? new Date(data.last_synced) : undefined,
    status: data.status as ConnectionStatus,
    syncFrequency: data.sync_frequency,
  };

  try {
    console.log(`Syncing Instagram followers for ${connection.username}...`);
    const mutuals = await getInstagramMutualContacts(connection);
    const contacts: Omit<Tables<"instagram_contacts">, "user_id" | "created_at">[] = mutuals.map(f => ({
      connection_id: connection.id,
      full_name: f.full_name || f.username || null,
      is_private: f.is_private,
      is_verified: f.is_verified,
      last_synced: new Date().toISOString(),
      profile_picture: f.profile_pic_url,
      user_id_instagram: f.id,
      username: f.username,
      internal_id: f.id, // Use the Instagram ID as internal_id
      // Required fields with safe defaults
      followed_by_viewer: true,
      follower_count: 0,
      following_count: 0,
      follows_viewer: true,
      mutual_followers: [],
      requested_by_viewer: false,
    }));
    if (contacts.length > 0) {
      const { error: upsertError } = await supabase
        .from("instagram_contacts")
        .upsert(contacts, { onConflict: "connection_id,user_id_instagram" });
      if (upsertError) throw upsertError;
    }
    const { error: finalUpdateError } = await supabase
      .from("instagram_connections")
      .update({
        status: ConnectionStatus.Connected,
        last_synced: new Date().toISOString(),
        follower_count: mutuals.length,
      })
      .eq("id", connectionId);
    if (finalUpdateError) throw finalUpdateError;
  } catch (err) {
    await supabase
      .from("instagram_connections")
      .update({ status: ConnectionStatus.Error })
      .eq("id", connectionId);
    console.error("Error syncing Instagram connection:", err);
    throw err;
  }
}

export async function POST(request: Request) {
  const { connectionId, provider } = (await request.json()) as {
    connectionId: string;
    provider: "linkedin" | "instagram";
  };

  const supabase = await createClient();

  try {
    if (provider === "linkedin") {
      await syncLinkedinConnection(connectionId, supabase);
    } else if (provider === "instagram") {
      await syncInstagramConnection(connectionId, supabase);
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid provider" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "An error occurred while syncing connections",
        details: (error as Error).message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(null, { status: 204 });
}
