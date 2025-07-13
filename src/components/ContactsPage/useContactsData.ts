"use client";

import { useCallback, useEffect, useState } from "react";
import { Contact } from "@/models/contacts";
import { createClient } from "@/utils/supabase/client";
import { useUser } from "@/app/context/userContext";
import toast from "react-hot-toast";

interface AddressBookConnection {
  id: string;
  displayName: string;
  connectionName: string;
  connectionId: string;
}

interface UseContactsDataReturn {
  contacts: Contact[];
  availableConnections: AddressBookConnection[];
  isLastPage: boolean;
  isLoading: boolean;
  fetchContacts: (
    currentPage: number,
    itemsPerPage: number,
    addressBook: string | null,
    search: string,
    sortField: string,
    sortDirection: string,
    sourceFilter: string,
  ) => Promise<void>;
  fetchConnections: () => Promise<void>;
}

export function useContactsData(): UseContactsDataReturn {
  const supabase = createClient();
  const { user } = useUser();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [availableConnections, setAvailableConnections] = useState<AddressBookConnection[]>([]);
  const [isLastPage, setIsLastPage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchContacts = useCallback(
    async function (
      currentPage: number,
      itemsPerPage: number,
      addressBook: string | null,
      search: string,
      sortField: string,
      sortDirection: string,
      sourceFilter: string = "all",
    ) {
      if (!user) {
        setContacts([]);
        return;
      }

      setIsLoading(true);

      try {
        let orderField = sortField;
        if (sortField === "email") orderField = "emails";
        if (sortField === "company") orderField = "company";
        if (sortField === "lastUpdated") orderField = "lastUpdated";

        let query = supabase
          .from("carddav_contacts")
          .select(
            `
            *, 
            linkedin_contacts(internal_id, public_identifier, entity_urn),           
            instagram_contacts(internal_id, username, full_name),
            carddav_addressbooks (
              *,
              carddav_connections (
                id,
                name
              )
            )`,
          )
          .order(orderField, { ascending: sortDirection === "asc" })
          .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
          .or("hidden.is.null,hidden.eq.false"); // Only show non-hidden contacts

        if (addressBook) {
          query = query.eq("address_book", addressBook);
        }

        if (search.length > 0) {
          query = query.ilike("name", `%${search}%`);
        }

        // Apply source filtering
        if (sourceFilter === "LinkedIn") {
          query = query.not("linkedin_id", "is", null);
        } else if (sourceFilter === "Instagram") {
          query = query.not("instagram_id", "is", null);
        }

        const { data, error } = await query;

        if (error) {
          console.error("Error fetching contacts:", error);
          toast.error("Failed to fetch contacts. Please try again later.");
          setContacts([]);
          return;
        }

        const newContacts = await Promise.all(
          data
            .slice(0, itemsPerPage)
            .map((contact) => Contact.fromDatabaseObject(contact)),
        );

        setContacts(newContacts);
        setIsLastPage(data.length <= itemsPerPage);
      } catch (error) {
        console.error("Error fetching contacts:", error);
        toast.error("Failed to fetch contacts. Please try again later.");
        setContacts([]);
      } finally {
        setIsLoading(false);
      }
    },
    [user, supabase],
  );

  const fetchConnections = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("carddav_addressbooks")
        .select(`id, display_name, carddav_connections(id,name)`);

      if (error) {
        console.error("Error fetching CardDAV connections:", error);
        return;
      }

      setAvailableConnections(
        data.map((conn) => ({
          id: conn.id,
          displayName: conn.display_name ?? "Unknown Address Book",
          connectionName: conn.carddav_connections.name,
          connectionId: conn.carddav_connections.id,
        })),
      );
    } catch (error) {
      console.error("Error fetching connections:", error);
    }
  }, [supabase]);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  return {
    contacts,
    availableConnections,
    isLastPage,
    isLoading,
    fetchContacts,
    fetchConnections,
  };
} 