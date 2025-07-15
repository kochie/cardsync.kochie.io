import { createClient } from "@/utils/supabase/server";

export default async function TotalContactsCount() {
  const supabase = await createClient();
  const { count: totalContacts } = await supabase
    .from("carddav_contacts")
    .select("id", { count: "estimated", head: true });

  return (
    <span>{totalContacts?.toLocaleString() ?? "-"}</span>
  );
} 