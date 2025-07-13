"use client";

import { useState, useEffect } from "react";
import { Combobox, ComboboxOption, ComboboxLabel, ComboboxDescription } from "../ui/combobox";
import { useDebounce } from "@uidotdev/usehooks";
import { createClient } from "@/utils/supabase/client";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers } from "@fortawesome/free-solid-svg-icons";

interface Group {
  id: string;
  name: string;
  memberCount?: number;
}

interface GroupSelectorProps {
  addressBookId: string;
  onAdd: (group: Group) => void;
  existingGroups: Group[];
}

export default function GroupSelector({
  addressBookId,
  onAdd,
  existingGroups,
}: GroupSelectorProps) {
  const supabase = createClient();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [options, setOptions] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState<Group | null>(null);

  useEffect(() => {
    if (!debouncedSearchTerm) {
      setOptions([]);
      return;
    }
    setLoading(true);
    supabase
      .from("carddav_groups")
      .select("id, name")
      .ilike("name", `%${debouncedSearchTerm}%`)
      .eq("address_book", addressBookId)
      .limit(10)
      .then(async ({ data, error }) => {
        setLoading(false);
        if (error) {
          setOptions([]);
          return;
        }
        
        // Get member counts for each group
        const groupsWithCounts = await Promise.all(
          (data ?? []).map(async (g) => {
            const { count } = await supabase
              .from("carddav_group_members")
              .select("member_id", { count: "exact", head: true })
              .eq("group_id", g.id);
            
            return {
              id: String(g.id),
              name: String(g.name ?? ""),
              memberCount: count || 0
            };
          })
        );
        
        setOptions(groupsWithCounts.filter((g) => g.name.length > 0));
      });
  }, [debouncedSearchTerm, addressBookId, supabase]);

  const handleAdd = async (group: { id?: string; name: string; memberCount?: number }) => {
    // Prevent adding if already in group
    if (existingGroups.some((g) => g.name.toLowerCase() === group.name.toLowerCase())) {
      setSearchTerm("");
      setValue(null);
      return;
    }
    let groupObj = group;
    if (!group.id) {
      // Create new group
      const { data, error } = await supabase
        .from("carddav_groups")
        .insert({
          name: group.name.trim(),
          address_book: addressBookId,
          id_is_uppercase: false,
          readonly: false,
        })
        .select()
        .single();
      if (error || !data) {
        toast.error("Failed to create group");
        return;
      }
      groupObj = { id: data.id, name: data.name ?? "", memberCount: 0 };
    }
    onAdd({ id: groupObj.id!, name: groupObj.name, memberCount: groupObj.memberCount || 0 });
    setSearchTerm("");
    setValue(null);
  };

  // Compose options: existing + create option if needed
  let comboOptions = options;
  if (
    debouncedSearchTerm &&
    !loading &&
    !comboOptions.some((g) => g.name.toLowerCase() === debouncedSearchTerm.toLowerCase()) &&
    !existingGroups.some((g) => g.name.toLowerCase() === debouncedSearchTerm.toLowerCase())
  ) {
    comboOptions = [
      ...comboOptions,
      { id: "create", name: `Create group: ${debouncedSearchTerm}`, memberCount: 0 },
    ];
  }

  return (
    <Combobox
      options={comboOptions}
      displayValue={(g) => g?.name.replace(/^Create group: /, "") || ""}
      value={value}
      onChange={(g) => {
        if (g?.id === "create") {
          handleAdd({ name: debouncedSearchTerm });
        } else if (g) {
          setValue(g);
          handleAdd(g);
        }
      }}
      onQueryChange={setSearchTerm}
      placeholder="Add to group..."
      className="w-full"
      aria-label="Add to group"
    >
      {(g) => (
        <ComboboxOption key={g.id} value={g}>
          <ComboboxLabel>{g.name}</ComboboxLabel>
          {g.id !== "create" && (
            <ComboboxDescription>
              <div className="flex items-center text-xs text-gray-500">
                <FontAwesomeIcon icon={faUsers} className="mr-1" />
                {g.memberCount === 1 ? "1 member" : `${g.memberCount} members`}
              </div>
            </ComboboxDescription>
          )}
          {loading && g.id === comboOptions[0]?.id && (
            <span className="ml-2 text-xs text-blue-500 animate-pulse">Loading...</span>
          )}
        </ComboboxOption>
      )}
    </Combobox>
  );
} 