"use client";

import { Avatar } from "../ui/avatar";
// import { createClient } from "@/utils/supabase/client";

export default function SupabaseAvatar({
  path,
  name,
  blurDataURL,
}: {
  path: string;
  name: string;
  blurDataURL?: string;
}) {
  // const supabase = createClient();
  // const { data } = supabase.storage.from("assets").getPublicUrl(path);

  return (
    <Avatar
      className="h-13 w-13"
      initials={name
        .split(" ")
        .map((n) => n[0])
        .join("")}
      src={`assets/${path}`}
      alt={name}
      blurDataURL={blurDataURL}
    />
  );
}
