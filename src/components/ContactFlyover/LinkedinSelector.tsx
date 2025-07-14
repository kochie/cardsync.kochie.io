"use client";

import { LinkedinContact, LinkedinContactModel } from "@/models/linkedinContact";
import { Field, Label } from "../ui/fieldset";
import { Combobox, ComboboxDescription, ComboboxLabel, ComboboxOption } from "../ui/combobox";
import Image from "next/image";
import { useDebounce } from "@uidotdev/usehooks";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function LinkedinSelector({
  onSelect,
  defaultValue,
}: {
  defaultValue?: LinkedinContact;
  selectedContact?: string;
  onSelect: (contact: LinkedinContactModel | null) => void;
}) {
  const supabase = createClient();

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const [linkedinContacts, setLinkedinContacts] = useState<LinkedinContact[]>(
    []
  );

  const [selectedContact, setSelectedContact] = useState<LinkedinContact | null>(
    defaultValue ?? null
  );

  const fetchLinkedinContacts = useCallback(
    async (searchQuery: string) => {
      console.log("Fetching LinkedIn contacts for:", searchQuery);

      const { data, error } = await supabase
        .from("linkedin_contacts")
        .select("*")
        .ilike("full_name", `%${searchQuery}%`)
        .limit(10)
        .order("full_name", { ascending: true });

      if (error) {
        console.error("Error fetching LinkedIn contacts:", error);
        return;
      }

      console.log("Found LinkedIn contacts:", data);
      setLinkedinContacts(
        data.map((item) => LinkedinContact.fromDatabaseObject(item))
      );
    },
    [supabase]
  );

  useEffect(() => {
    // if (!debouncedSearchTerm) return;

    fetchLinkedinContacts(debouncedSearchTerm);
  }, [debouncedSearchTerm, fetchLinkedinContacts]);

  return (
    <Field>
      <Label>Linkedin</Label>
      <Combobox
        name="linkedin-contact"
        onChange={(person) => {
          // setSearchTerm("");
          setSelectedContact(person);
          onSelect(person?.toModel() ?? null);
        }}
        onQueryChange={(query) => setSearchTerm(query)}
        placeholder="Search LinkedIn contacts"
        options={linkedinContacts}
        defaultValue={defaultValue}
        displayValue={(contact) =>
          contact ? `${contact.firstName ?? ""} ${contact.lastName ?? ""}` : ""
        }
        value={selectedContact}
        anchor="top"
        by="publicIdentifier"
      >
        {(person) => (
          <ComboboxOption
            key={person.entityUrn}
            value={person}
          >
            <Image
              width={24}
              height={24}
              src={person.profilePicture ?? "/images/default-avatar.svg"}
              alt=""
              className="shrink-0 rounded-full"
            />
            <ComboboxLabel>
              {person.firstName} {person.lastName}
            </ComboboxLabel>
            <ComboboxDescription>{person.publicIdentifier}</ComboboxDescription>
          </ComboboxOption>
        )}
      </Combobox>
    </Field>
  );
}
