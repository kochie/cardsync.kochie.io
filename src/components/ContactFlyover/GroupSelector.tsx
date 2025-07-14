"use client";

import { useState, useEffect } from "react";
import { Combobox, ComboboxOption, ComboboxLabel, ComboboxDescription } from "../ui/combobox";
import { useDebounce } from "@uidotdev/usehooks";
import { createClient } from "@/utils/supabase/client";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers } from "@fortawesome/free-solid-svg-icons";
import { Group } from "@/models/groups";

// Temporary interface for the "create" option
interface CreateGroupOption {
  id: string;
  name: string;
  memberCount: number;
}

type GroupOption = Group | CreateGroupOption;

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
  const [value, setValue] = useState<GroupOption | null>(null);

  useEffect(() => {
    if (!debouncedSearchTerm) {
      setOptions([]);
      return;
    }
    setLoading(true);
    supabase
      .from("carddav_groups")
      .select("*, carddav_contacts(carddav_addressbooks(*))")
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
            const { data: members, error } = await supabase
              .from("carddav_group_members")
              .select("member_id")
              .eq("group_id", g.id);
            
            if (error) {
              console.error("Error fetching group members:", error);
              return Group.fromDatabaseObject(g, g.carddav_contacts[0].carddav_addressbooks, []);
            }
            
            return Group.fromDatabaseObject(g, g.carddav_contacts[0].carddav_addressbooks, members?.map(m => m.member_id) || []);
          })
        );
        
        setOptions(groupsWithCounts);
      });
  }, [debouncedSearchTerm, addressBookId, supabase]);

  const handleAdd = async (group: GroupOption) => {
    // Prevent adding if already in group
    if (existingGroups.some((g) => g.name.toLowerCase() === group.name.toLowerCase())) {
      setSearchTerm("");
      setValue(null);
      return;
    }

    // If it's a "create" option, create a new group
    if (group.id === "create") {
      const { data, error } = await supabase
        .from("carddav_groups")
        .insert({
          name: debouncedSearchTerm.trim(),
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

      // Fetch the address book data to create a proper Group object
      const { data: addressBookData, error: addressBookError } = await supabase
        .from("carddav_addressbooks")
        .select("*")
        .eq("id", addressBookId)
        .single();

      if (addressBookError || !addressBookData) {
        toast.error("Failed to fetch address book data");
        return;
      }

      // Create a proper Group object for the new group
      const newGroup = Group.fromDatabaseObject(
        data,
        addressBookData,
        []
      );

      onAdd(newGroup);
    } else {
      // It's an existing group
      onAdd(group as Group);
    }
    
    setSearchTerm("");
    setValue(null);
  };

  // Compose options: existing + create option if needed
  let comboOptions: GroupOption[] = options;
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
        if (g) {
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