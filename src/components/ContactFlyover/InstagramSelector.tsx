"use client";

import { InstagramContactModel } from "@/types/instagram.types";
import { Field, Label } from "../ui/fieldset";
import { Combobox, ComboboxDescription, ComboboxLabel, ComboboxOption } from "../ui/combobox";
import Image from "next/image";
import { useDebounce } from "@uidotdev/usehooks";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function InstagramSelector({
  onSelect,
  defaultValue,
}: {
  defaultValue?: InstagramContactModel;
  selectedContact?: string;
  onSelect: (contact: InstagramContactModel | null) => void;
}) {
  const supabase = createClient();

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const [instagramContacts, setInstagramContacts] = useState<InstagramContactModel[]>([]);
  const [selectedContact, setSelectedContact] = useState<InstagramContactModel | null>(defaultValue ?? null);

  const fetchInstagramContacts = useCallback(
    async (searchQuery: string) => {
      const { data, error } = await supabase
        .from("instagram_contacts")
        .select("*")
        .ilike("full_name", `%${searchQuery}%`)
        .limit(10)
        .order("full_name", { ascending: true });
      if (error || !data) {
        console.error("Error fetching Instagram contacts:", error);
        return;
      }
      setInstagramContacts(
        data.map((item) => ({
          internalId: item.internal_id,
          connectionId: item.connection_id,
          userId: item.user_id_instagram,
          username: item.username,
          fullName: item.full_name ?? undefined,
          profilePicture: item.profile_picture ?? undefined,
          isPrivate: item.is_private,
          isVerified: item.is_verified,
          followerCount: item.follower_count ?? 0,
          followingCount: item.following_count ?? 0,
          mutualFollowers: item.mutual_followers ?? [],
          followedByViewer: item.followed_by_viewer ?? false,
          followsViewer: item.follows_viewer ?? false,
          requestedByViewer: item.requested_by_viewer ?? false,
        }))
      );
    },
    [supabase]
  );

  useEffect(() => {
    fetchInstagramContacts(debouncedSearchTerm);
  }, [debouncedSearchTerm, fetchInstagramContacts]);

  return (
    <Field>
      <Label>Instagram</Label>
      <Combobox
        name="instagram-contact"
        onChange={(person) => {
          setSelectedContact(person);
          onSelect(person);
        }}
        onQueryChange={(query) => setSearchTerm(query)}
        placeholder="Search Instagram contacts"
        options={instagramContacts}
        defaultValue={defaultValue}
        displayValue={(contact) =>
          contact ? `${contact.fullName ?? ""} (@${contact.username ?? ""})` : ""
        }
        value={selectedContact}
        anchor="top"
        by="internalId"
      >
        {(person) => (
          <ComboboxOption key={person.internalId} value={person}>
            <Image
              width={24}
              height={24}
              src={person.profilePicture || "/images/default-avatar.svg"}
              alt=""
              className="shrink-0 rounded-full"
            />
            <ComboboxLabel>
              {person.fullName || person.username}
            </ComboboxLabel>
            <ComboboxDescription>@{person.username}</ComboboxDescription>
          </ComboboxOption>
        )}
      </Combobox>
    </Field>
  );
} 