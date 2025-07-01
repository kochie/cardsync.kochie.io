import { syncAccount } from "@/utils/account/sync";
import { createClient } from "@/utils/supabase/server";

interface SyncRequestBody {
  cardId: string;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return new Response(
      JSON.stringify({
        error: "Unauthorized",
        details: "You must be logged in to access this resource.",
      }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const { cardId } = (await request.json()) as SyncRequestBody;

  await syncAccount(cardId, supabase);

  return new Response(null, { status: 204 });
}
