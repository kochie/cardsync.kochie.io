import { ConnectionStatus, LinkedinConnection } from "@/models/linkedinContact";
import { linkedinDetectDuplicates } from "@/utils/linkedin/duplicates";
import { getLinkedinConnections } from "@/utils/linkedin/list";
import { uploadConnections } from "@/utils/linkedin/upload";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  const { connectionId } = (await request.json()) as {
    connectionId: string;
  };

  try {
    const supabase = await createClient();

    const { data, error: queryError } = await supabase
      .from("linkedin_connections")
      .select("*")
      .eq("id", connectionId)
      .single();

    if (queryError) throw queryError;

    const connection = LinkedinConnection.fromDatabaseObject(data);
    if (connection.status === ConnectionStatus.Syncing) {
      return new Response(
        JSON.stringify({
          error: "Connection is already syncing",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { error: updateError } = await supabase
      .from("linkedin_connections")
      .update({
        status: ConnectionStatus.Syncing,
      })
      .eq("id", connectionId);

    if (updateError) throw updateError;

    console.log(`Syncing LinkedIn connections for ${connection.name}...`);
    const profiles = await getLinkedinConnections(connection);
    await uploadConnections(profiles, connection.id);

    console.log(`Detecting duplicates for ${connection.name}...`);
    await linkedinDetectDuplicates();

    const { error: finalUpdateError } = await supabase
      .from("linkedin_connections")
      .update({
        status: ConnectionStatus.Connected,
        last_synced: new Date().toISOString(),
        number_contacts: profiles.length
      })
      .eq("id", connectionId);

    if (finalUpdateError) throw finalUpdateError;
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
