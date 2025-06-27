"use client";

import { useCallback, useEffect, useState } from "react";
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
import { ContactWithSources } from "@/models/contacts";
import { Badge, BadgeProps } from "@/components/ui/badge";
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
import camelcaseKeys from "camelcase-keys";
import { VCardProperty } from "@/utils/vcard";

function getEmailTypeColor(type: string): BadgeProps["color"] {
  switch (type.toLowerCase()) {
    case "home":
      return "blue";
    case "work":
      return "green";
    case "internet":
      return "purple";
    case "pref":
      return "orange";
    case "cell":
      return "lime";
    case "voice":
      return "yellow";
    case "x-mobile":
    case "mobile":
      return "pink";
    default:
      return "zinc"; // fallback for unknown types
  }
}

export default function ContactsPage() {
  const supabase = createClient();

  const searchParams = useSearchParams();
  const { user } = useUser();

  const [contactsData, setContactsData] = useState<ContactWithSources[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const [isLastPage, setIsLastPage] = useState(false);

  const [availableConnections, setAvailableConnections] = useState<
    { id: string; conenctionName: string, displayName:string, connectionId:string }[]
  >([]); // Available connections for the select dropdown

  // Items per page state
  // const [itemsPerPage, setItemsPerPage] = useState(10);

  const [contact, setSelectedContact] = useState<ContactWithSources | null>(null);

  const router = useRouter();

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

  const currentPage = searchParams.has("page")
    ? parseInt(searchParams.get("page") ?? "1", 10)
    : 1;

  const itemsPerPage = searchParams.has("itemsPerPage")
    ? parseInt(searchParams.get("itemsPerPage") ?? "25", 10)
    : 10;

  const addressBook = searchParams.get("addressBook") || null;

  const fetchContacts = useCallback(
    async function () {
      if (!user) {
        setContactsData([]);
        return;
      }

      console.log("Fetching contacts for user:", user.id);

      let orderField = sortField;
      if (sortField === "email") orderField = "emails";
      if (sortField === "company") orderField = "company";
      if (sortField === "lastUpdated") orderField = "lastUpdated";

      let query = supabase
        .from("carddav_contacts")
        .select(`
          *, 
          linkedin_contacts(public_identifier),           
          carddav_addressbooks (
            id,
            connection_id,
            display_name,
            carddav_connections (
              id,
              name
            )
          )`)
        .order(orderField, { ascending: sortDirection === "asc" })
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

      if (addressBook) {
        query = query.eq("address_book", addressBook);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching contacts:", error);
        setContactsData([]);
        return;
      }
      // Immediately populate contacts with placeholder photoUrls
      console.log("Fetched contacts:", data);

      
      setContactsData(camelcaseKeys(data.slice(0, itemsPerPage).map((contact) =>
          ({
            ...contact,
            name: contact.name ?? "",
            company: contact.company ?? undefined,
            linkedin_contact: contact.linkedin_contact ?? undefined,
            role: contact.role ?? undefined,
            title: contact.title ?? undefined,
            address_book: contact.address_book,
            last_updated: contact.last_updated
              ? new Date(contact.last_updated)
              : undefined,
            photo_blur_url: contact.photo_blur_url ?? undefined,
            linkedin_public_identifier:
              contact.linkedin_contacts?.public_identifier ?? undefined,
            photos: [],
            addresses: contact.addresses.map((address) => VCardProperty.parse(address)),
            emails: contact.emails.map((email) => VCardProperty.parse(email)),
            phones: contact.phones.map((phone) => VCardProperty.parse(phone)),
            connectionId: contact.carddav_addressbooks.carddav_connections.id,
            connectionName: contact.carddav_addressbooks.carddav_connections.name,
            addressBookId: contact.carddav_addressbooks.id,
            addressBookDisplayName: contact.carddav_addressbooks.display_name,
            addressBookConnectionId: contact.carddav_addressbooks.connection_id,

          })) , {deep: true}));

      setIsLastPage(data.length <= itemsPerPage);
    },
    [itemsPerPage, sortField, sortDirection, user, currentPage, supabase, addressBook]
  );

  useEffect(() => {
    supabase.from("carddav_addressbooks").select(`id, display_name, carddav_connections(id,name)`).then(({ data, error }) => {
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
          conenctionName: conn.carddav_connections.name,
          connectionId: conn.carddav_connections.id
        }))
      );
    })
  }, [supabase])

  // Firestore pagination: fetch contacts for the current page
  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const previousPage = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    if (currentPage <= 1) return undefined;

    params.set("page", (currentPage - 1).toString());
    return `?${params.toString()}`;
  }, [currentPage, searchParams]);

  const nextPage = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    if (isLastPage) return undefined;

    params.set("page", (currentPage + 1).toString());
    return `?${params.toString()}`;
  }, [searchParams, currentPage, isLastPage]);

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
              value={searchQuery}
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
              <span className="text-sm text-muted-foreground">Connections:</span>
              <Select
              onChange={(e) => {
                const selectedConnectionId = e.target.value;
                console.log("Selected connection ID:", selectedConnectionId);
                router.push(`?page=1&addressBook=${selectedConnectionId}`);
              }}
              value={addressBook ?? ""}>
                {availableConnections.map((conn) => (
                  <option key={conn.id} value={conn.id}>
                    {conn.displayName} - {conn.conenctionName}
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
            onClose={() => setSelectedContact(null)}
            open={!!contact}
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
                          path={`users/${user?.id}/contacts/${contact.id}`}
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
                        onClick={() => setSelectedContact(contact)}
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
