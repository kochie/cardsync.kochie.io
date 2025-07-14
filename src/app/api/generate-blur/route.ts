import { NextRequest } from "next/server";
import { getPlaiceholder } from "plaiceholder";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { contactId, imageBase64 } = await request.json();
    if (!contactId || !imageBase64) {
      return new Response(JSON.stringify({ error: "Missing contactId or imageBase64" }), { status: 400 });
    }
    // Decode base64 to buffer
    const buffer = Buffer.from(imageBase64, "base64");
    const { base64 } = await getPlaiceholder(buffer);

    // Update the contact in Supabase
    const supabase = await createClient();
    const { error } = await supabase
      .from("carddav_contacts")
      .update({ photo_blur_url: base64 })
      .eq("id", contactId);
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
    return new Response(JSON.stringify({ blur: base64 }), { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
    return new Response(JSON.stringify({ error: "Unknown error occurred" }), { status: 500 });
  }
} 