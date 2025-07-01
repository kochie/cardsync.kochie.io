import { SupabaseClient } from "@supabase/supabase-js";

export async function uploadImageToSupabase(
  path: string,
  photobase64: string,
  supabase: SupabaseClient
): Promise<void> {
  // Decode base64 string to Uint8Array
  const photoBuffer = Uint8Array.from(atob(photobase64), c => c.charCodeAt(0));

  const doesExist = await supabase.storage.from("assets").exists(path);

  let alreadyUploaded = false;
  if (doesExist.data.valueOf() && !doesExist.error) {
    const info = await supabase.storage.from("assets").info(path);
    if (info.error) {
      console.error(`Failed to get info for contact ${path}:`, info.error);
      return;
    }
    const hash = await crypto.subtle.digest("SHA-256", photoBuffer);
    const hashBase64 = btoa(String.fromCharCode(...new Uint8Array(hash)));
    alreadyUploaded = info.data.metadata?.["hash"] === hashBase64;
  }

  if (!alreadyUploaded) {
    const hash = await crypto.subtle.digest("SHA-256", photoBuffer);
    const hashBase64 = btoa(String.fromCharCode(...new Uint8Array(hash)));

    const { error } = await supabase.storage
      .from("assets")
      .upload(path, photoBuffer, {
        contentType: "image/jpeg",
        upsert: true,
        metadata: {
          hash: hashBase64,
        },
      });
    if (error) {
      console.error(`Failed to upload photo for contact ${path}:`, error);
      throw new Error("Failed to upload photo");
    }
  }
}