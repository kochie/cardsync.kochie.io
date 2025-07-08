"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input, InputGroup } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select } from "@/components/ui/select";
import { ChevronDown, Download, Filter, Plus } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEllipsis,
  faSearch,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";
import { Contact } from "@/models/contacts";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { faLinkedin } from "@fortawesome/free-brands-svg-icons";
import SupabaseAvatar from "@/components/SupabaseAvatar";
import ContactFlyover from "@/components/ContactFlyover";
import { createClient } from "@/utils/supabase/client";
import { useUser } from "@/app/context/userContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@uidotdev/usehooks";
import { getEmailTypeColor } from "@/utils/color/badgeColor";
import toast from "react-hot-toast";

interface AddressBookConnection {
  id: string;
  displayName: string;
  connectionName: string;
  connectionId: string;
}

export default function ContactsPage() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useUser();

  // State to hold the contacts data
  // This will be populated with contact objects fetched from the database
  const [contactsData, setContactsData] = useState<Contact[]>([]);

  // State to track the current source filter
  // This will be used to filter contacts by their source (e.g., LinkedIn, Facebook, Slack)
  // Default is "all" which shows all contacts regardless of source
  const [sourceFilter, setSourceFilter] = useState("all");

  // State to track the current sort field
  // This will be used to determine which field to sort contacts by
  const [sortField, setSortField] = useState("name");

  // State to track the current sort direction
  // This will be used to toggle between ascending and descending order
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // State to track if we are on the last page of contacts
  // This is used to disable the next page button when there are no more contacts to fetch
  const [isLastPage, setIsLastPage] = useState(false);

  // State to hold the current page number
  // This will be used for pagination to determine which page of contacts to display
  const [currentPage, setCurrentPage] = useState(1);

  // State to hold the number of items per page
  // This will be used to determine how many contacts to display per page
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // State to hold the currently selected address book for filtering
  // This will be used to filter contacts by the selected address book connection
  const [addressBook, setAddressBook] = useState<string | null>(null);

  // State to hold available CardDAV connections for filtering
  // This will be used to populate the dropdown for selecting address books
  const [availableConnections, setAvailableConnections] = useState<
    AddressBookConnection[]
  >([]);

  // State to hold the currently selected contact for the flyover
  const [contact, setSelectedContact] = useState<Contact | null>(null);

  const [, startTransition] = useTransition();

  // Used for searching contacts with the db
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const debouncedSearchTerm = useDebounce(searchQuery, 300);

  function handleSort(field: string) {
    if (sortField === field) {
      // Toggle sort direction if already sorted by this field
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      // Set new sort field and default to ascending
      setSortField(field);
      setSortDirection("asc");
    }
  }

  const fetchContacts = useCallback(
    async function (
      currentPage: number,
      itemsPerPage: number,
      addressBook: string | null,
      search: string,
      sortField: string,
      sortDirection: string,
    ) {
      if (!user) {
        setContactsData([]);
        return;
      }

      let orderField = sortField;
      if (sortField === "email") orderField = "emails";
      if (sortField === "company") orderField = "company";
      if (sortField === "lastUpdated") orderField = "lastUpdated";

      let query = supabase
        .from("carddav_contacts")
        .select(
          `
          *, 
          linkedin_contacts(public_identifier, entity_urn),           
          carddav_addressbooks (
            *,
            carddav_connections (
              id,
              name
            )
          )`,
        )
        .order(orderField, { ascending: sortDirection === "asc" })
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

      if (addressBook) {
        query = query.eq("address_book", addressBook);
      }

      // when the search term changes the counter should reset to page 1
      if (search.length > 0) {
        query = query.ilike("name", `%${search}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching contacts:", error);
        toast.error("Failed to fetch contacts. Please try again later.");
        setContactsData([]);
        return;
      }

      const newContacts = await Promise.all(
        data
          .slice(0, itemsPerPage)
          .map((contact) => Contact.fromDatabaseObject(contact)),
      );

      setContactsData(newContacts);
      setIsLastPage(data.length <= itemsPerPage);
    },
    [user, supabase],
  );

  useEffect(() => {
    supabase
      .from("carddav_addressbooks")
      .select(`id, display_name, carddav_connections(id,name)`)
      .then(({ data, error }) => {
        if (error) {
          console.error("Error fetching CardDAV connections:", error);
          return;
        }

        console.log("Fetched CardDAV connections:", data);
        // Set the first connection ID if available
        setAvailableConnections(
          data.map((conn) => ({
            id: conn.id,
            displayName: conn.display_name ?? "Unknown Address Book",
            connectionName: conn.carddav_connections.name,
            connectionId: conn.carddav_connections.id,
          })),
        );
      });
  }, [supabase]);

  useEffect(() => {
    const currentPage = searchParams.has("page")
      ? parseInt(searchParams.get("page") ?? "1", 10)
      : 1;
    setCurrentPage(currentPage);

    const itemsPerPage = searchParams.has("itemsPerPage")
      ? parseInt(searchParams.get("itemsPerPage") ?? "25", 10)
      : 25;
    setItemsPerPage(itemsPerPage);

    const addressBook = searchParams.get("addressBook") || null;
    setAddressBook(addressBook);

    const search = searchParams.get("search") || "";
    setSearchQuery(search);

    const sortField = searchParams.get("sortField") || "name";
    setSortField(sortField);

    const sortDirection = (searchParams.get("sortDirection") ?? "asc") as
      | "asc"
      | "desc";
    setSortDirection(sortDirection);
  }, [searchParams]);

  useEffect(() => {
    /**
     * This effect was a headache. I'm going to try and explain the logic here.
     *
     * The goal of this effect is to update the URL search params with the
     * debounced search term whenever it changes. This allows the search term to
     * be reflected in the URL and also allows for deep linking to specific
     * search results.
     *
     * The debounced search term is used to prevent unnecessary updates to the
     * URL when the user is still typing. The debounced value is updated after a
     * delay, so this effect will only run when the user has stopped typing for
     * a certain amount of time.
     *
     * Also doesn't use searchParams hook directly so the effect will not run if
     * the params change.
     */
    const params = new URLSearchParams(window.location.search);

    /**
     * Before the page loads the search term is set to null, so until the value
     * is read from query params in the other hook this effect should not run.
     *
     * It also should not run if the debounced search term is the same as the
     * current search param in the URL. This prevents unnecessary updates.
     */
    if (
      debouncedSearchTerm === null ||
      debouncedSearchTerm === params.get("search")
    ) {
      return;
    }

    /**
     * If the search term is not empty then update the params to include the
     * search term and reset the page to 1. If the search term is empty and
     * there is a search param in the URL, then remove the search param and
     * reset the page to 1.
     *
     * If the search term is empty and there is no search param in the URL, then
     * do nothing. This prevents the URL from being updated unnecessarily.
     */
    if (debouncedSearchTerm.length > 0) {
      params.set("search", debouncedSearchTerm);
      params.set("page", "1");
    } else if (params.has("search")) {
      params.delete("search");
      params.set("page", "1");
    }

    /**
     * Lastly, if the current URL search params do not match the updated params,
     * then push the new params to the router. This will update the URL without
     * causing a full page reload.
     */
    if (window.location.search !== `?${params.toString()}`) {
      router.push(`?${params.toString()}`, { scroll: false });
    }
  }, [debouncedSearchTerm, router]);

  // This runs whenever the search params change
  useEffect(() => {
    fetchContacts(
      currentPage,
      itemsPerPage,
      addressBook,
      debouncedSearchTerm ?? "",
      sortField,
      sortDirection,
    );
  }, [
    fetchContacts,
    currentPage,
    itemsPerPage,
    addressBook,
    debouncedSearchTerm,
    sortField,
    sortDirection,
  ]);

  useEffect(() => {
    // Set flyover contact
    if (searchParams.has("contactId")) {
      const contactId = searchParams.get("contactId");
      if (contactId) {
        const contact = contactsData.find((c) => c.id === contactId);
        if (contact) {
          setSelectedContact(contact);
          return;
        }
      }
    }

    setSelectedContact(null);
  }, [contactsData, searchParams]);

  const previousPage = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    const currentPage = searchParams.has("page")
      ? parseInt(searchParams.get("page") ?? "1", 10)
      : 1;
    if (currentPage <= 1) return undefined;

    params.set("page", (currentPage - 1).toString());
    return `?${params.toString()}`;
  }, [searchParams]);

  const nextPage = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    if (isLastPage) return undefined;

    const currentPage = searchParams.has("page")
      ? parseInt(searchParams.get("page") ?? "1", 10)
      : 1;
    params.set("page", (currentPage + 1).toString());
    return `?${params.toString()}`;
  }, [isLastPage, searchParams]);

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 container py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">All Contacts</h1>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Contact
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6 items-start md:items-center justify-between">
          <InputGroup className="">
            <FontAwesomeIcon icon={faSearch} className="" data-slot="icon" />
            <Input
              name="search"
              placeholder="Search&hellip;"
              aria-label="Search"
              onChange={(e) => setSearchQuery(e.target.value)}
              value={searchQuery ?? ""}
              className="w-lg"
            />
          </InputGroup>

          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
              >
                <option value="all">All Sources</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Facebook">Facebook</option>
                <option value="Slack">Slack</option>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Connections:
              </span>
              <Select
                onChange={(e) => {
                  const selectedConnectionId = e.target.value;
                  console.log("Selected connection ID:", selectedConnectionId);
                  router.push(`?page=1&addressBook=${selectedConnectionId}`);
                }}
                value={addressBook ?? ""}
              >
                {availableConnections.map((conn) => (
                  <option key={conn.id} value={conn.id}>
                    {conn.displayName} - {conn.connectionName}
                  </option>
                ))}
              </Select>
            </div>

            {/* Items per page selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Rows per page:
              </span>
              <Select
                value={itemsPerPage.toString()}
                onChange={(e) => {
                  router.push(`?page=1&itemsPerPage=${e.target.value}`);
                }}
              >
                {[10, 25, 50, 100].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </Select>
            </div>

            <Button>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <div className="rounded-md border">
          <ContactFlyover
            contact={contact}
            onClose={() => {
              const params = new URLSearchParams(window.location.search);
              params.delete("contactId");
              // setSelectedContact(null);
              startTransition(() => {
                router.push(`?${params.toString()}`, { scroll: false });
              });
            }}
          />
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader className="w-[250px] ">
                  <button
                    className="ml-4 flex items-center gap-1 hover:text-primary"
                    onClick={() => handleSort("name")}
                  >
                    Name
                    {sortField === "name" && (
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          sortDirection === "desc" ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </button>
                </TableHeader>
                <TableHeader>
                  <button
                    className="flex items-center gap-1 hover:text-primary"
                    onClick={() => handleSort("email")}
                  >
                    Email
                    {sortField === "email" && (
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          sortDirection === "desc" ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </button>
                </TableHeader>
                <TableHeader className="hidden md:table-cell">
                  Phone
                </TableHeader>
                {/* <TableHeader className="hidden lg:table-cell">
                  <button
                    className="flex items-center gap-1 hover:text-primary"
                    onClick={() => handleSort("company")}
                  >
                    Company
                    {sortField === "company" && (
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          sortDirection === "desc" ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </button>
                </TableHeader> */}
                <TableHeader className="hidden lg:table-cell">
                  Source
                </TableHeader>
                {/* <TableHeader className="hidden md:table-cell">
                  <button
                    className="flex items-center gap-1 hover:text-primary"
                    onClick={() => handleSort("lastUpdated")}
                  >
                    Last Updated
                    {sortField === "lastUpdated" && (
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          sortDirection === "desc" ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </button>
                </TableHeader> */}
                <TableHeader className="w-[70px]"></TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {contactsData.length > 0 ? (
                contactsData.map((contact) => (
                  <TableRow key={`${contact.id}-${contact.addressBook}`}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2 ml-4">
                        <SupabaseAvatar
                          path={`users/${user?.id}/contacts/${contact.id}`.toLowerCase()}
                          name={contact.name ?? ""}
                          blurDataURL={contact.photoBlurUrl}
                        />
                        <div>
                          <div>{contact.name}</div>
                          <div className="text-xs text-muted-foreground hidden sm:block">
                            {contact.title ?? "No Title"}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="align-top">
                      {(() => {
                        const email = contact.emails?.[0];
                        if (!email)
                          return (
                            <span className="text-muted-foreground text-sm italic">
                              No email
                            </span>
                          );

                        const types = email.params["TYPE"] || [];
                        return (
                          <div>
                            <div className="font-medium">{email.value}</div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {types.map((type) => (
                                <Badge
                                  key={type}
                                  color={getEmailTypeColor(type)}
                                  className="text-[10px] px-1.5 py-0.5 rounded-md"
                                >
                                  {type}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                    </TableCell>
                    <TableCell className="align-top hidden md:table-cell">
                      {(() => {
                        const phone = contact.phones?.[0];
                        if (!phone)
                          return (
                            <span className="text-muted-foreground text-sm italic">
                              No phone
                            </span>
                          );

                        const types = phone.params["TYPE"] ?? [];
                        return (
                          <div>
                            <div className="font-medium">{phone.value}</div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {types.map((type) => (
                                <Badge
                                  key={type}
                                  color={getEmailTypeColor(type)}
                                  className="text-[10px] px-1.5 py-0.5 rounded-md"
                                >
                                  {type}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                    </TableCell>
                    {/* <TableCell className="hidden lg:table-cell">
                      {contact.company}
                    </TableCell> */}
                    <TableCell className="hidden lg:table-cell text-center">
                      <div className="flex justify-center items-center gap-2">
                        <FontAwesomeIcon
                          icon={faEnvelope}
                          size="1x"
                          className="text-gray-500"
                        />

                        {contact.linkedinContact && (
                          <FontAwesomeIcon
                            icon={faLinkedin}
                            size="1x"
                            className="text-blue-700"
                          />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        className="h-8 w-8 p-0 flex items-center justify-center cursor-pointer transform duration-300"
                        onClick={() => {
                          startTransition(() => {
                            const params = new URLSearchParams(searchParams);
                            setSelectedContact(contact);
                            params.set("contactId", contact.id);
                            router.push(`?${params.toString()}`, {
                              scroll: false,
                            });
                          });
                        }}
                      >
                        <FontAwesomeIcon
                          icon={faEllipsis}
                          fixedWidth
                          className="h-4 w-4"
                        />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No contacts found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Page {currentPage}
          </div>
          <Pagination>
            <PaginationPrevious href={previousPage()} />
            <PaginationNext href={nextPage()} />
          </Pagination>
        </div>
      </main>
    </div>
  );
}
