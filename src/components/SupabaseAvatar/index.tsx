"use client";

import clsx from "clsx";
import { Avatar } from "../ui/avatar";
// import { createClient } from "@/utils/supabase/client";

export default function SupabaseAvatar({
  path,
  name,
  blurDataURL,
  square = false,
  className = "",
}: {
  path: string;
  name: string;
  square?: boolean;
  blurDataURL?: string;
  className?: string;
}) {
  // const supabase = createClient();
  // const { data } = supabase.storage.from("assets").getPublicUrl(path);

  return (
    <Avatar
      className={clsx("h-13 w-13", className)}
      initials={name
        .split(" ")
        .map((n) => n[0])
        .join("")}
      src={`assets/${path}`}
      alt={name}
      square={square}
      blurDataURL={blurDataURL}
    />
  );
}
