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
import {
  Dropdown,
  DropdownButton,
  DropdownItem,
  DropdownMenu,
} from "@/components/ui/dropdown";
import { Select } from "@/components/ui/select";
import { Avatar } from "@/components/ui/avatar";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Download,
  Edit,
  Filter,
  Plus,
  Trash2,
} from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEllipsis,
  faSearch,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";
import { ContactModel } from "@/models/contacts";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { app } from "@/firebase";
import { useAuth } from "@/context/AuthProvider";
import { contactConverter } from "@/models/contactConverter";
import { Badge, BadgeProps } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import {
  faFacebook,
  faLinkedin,
  faSlack,
} from "@fortawesome/free-brands-svg-icons";
import GoogleAvatar from "@/components/GoogleAvatar";
import ContactFlyover from "@/components/ContactFlyover";

const db = getFirestore(app);
const storage = getStorage(app);

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
  const [contactsData, setContactsData] = useState<ContactModel[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [lastVisible, setLastVisible] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  // const [pageStack, setPageStack] = useState<Array<QueryDocumentSnapshot<DocumentData> | null>>([null]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLastPage, setIsLastPage] = useState(false);

  // Items per page state
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { user } = useAuth();

  const [contact, setSelectedContact] = useState<ContactModel | null>(null);

  const fetchContacts = useCallback(
    async function () {
      console.log("Fetching contacts for user:", user?.uid);

      if (!user) {
        setContactsData([]);
        return;
      }

      let orderField = sortField;
      if (sortField === "email") orderField = "emails";
      if (sortField === "company") orderField = "company";
      if (sortField === "lastUpdated") orderField = "lastUpdated";
      const contactsQuery = query(
        collection(db, "users", user.uid, "contacts").withConverter(
          contactConverter
        ),
        orderBy(orderField, sortDirection),
        ...(lastVisible ? [startAfter(lastVisible)] : []),
        limit(itemsPerPage)
      );
      const snapshot = await getDocs(contactsQuery);

      // Immediately populate contacts with placeholder photoUrls
      const contacts = snapshot.docs.map((doc) => doc.data());
      console.log("Fetched contacts:", contacts);

      setContactsData(contacts);
      setIsLastPage(snapshot.docs.length < itemsPerPage);
    },
    [itemsPerPage, lastVisible, sortField, sortDirection, user]
  );

  // Firestore pagination: fetch contacts for the current page
  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // useEffect(() => {
  //   if (!user) return;

  //   contactsData.forEach(async (contact, i) => {
  //     try {
  //       if (!contact.photoUrl) {
  //         return
  //       }

  //       // console.log(contact)

  //       const fileRef = ref(
  //         storage,
  //         contact.photoUrl
  //       );
  //       //check if photo exists
  //       contact.photoUrl = await getDownloadURL(fileRef);

  //       setContactsData((prevContacts) => {
  //         const updatedContacts = [...prevContacts];
  //         updatedContacts[i] = contact; // Update the specific contact
  //         return updatedContacts;
  //       });
  //     } catch (error) {
  //       console.warn(`Failed to fetch photo for contact ${contact.id}:`, error);
  //     }
  //   });
  // }, [contactsData, user]);

  // Filtering and searching is now done on the client, but only for the current page's contacts
  const filteredContacts = contactsData.filter((contact) => {
    const matchesSearch =
      contact.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.emails?.some((email) =>
        email.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      contact.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSource =
      sourceFilter === "all" || contact.sources.includes(sourceFilter);
    return matchesSearch && matchesSource;
  });

  // Sorting is handled by Firestore query, so skip client sort

  // Pagination navigation handlers
  const handleNextPage = async () => {
    if (!user || contactsData.length === 0 || isLastPage) return;
    // const lastDoc = contactsData.length > 0 ? contactsData[contactsData.length - 1] : null;
    // Find the Firestore doc snapshot for startAfter
    let orderField = sortField;
    if (sortField === "email") orderField = "emails";
    if (sortField === "company") orderField = "company";
    if (sortField === "lastUpdated") orderField = "lastUpdated";
    const contactsQuery = query(
      collection(db, "users", user.uid, "contacts").withConverter(
        contactConverter
      ),
      orderBy(orderField, sortDirection),
      ...(lastVisible ? [startAfter(lastVisible)] : []),
      limit(itemsPerPage)
    );
    const snapshot = await getDocs(contactsQuery);
    if (snapshot.docs.length > 0) {
      // setPageStack((prev) => [...prev, snapshot.docs[0]]);
      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = async () => {
    if (currentPage <= 1) return;
    // Remove last page pointer from stack and go to previous
    // setPageStack((prev) => {
    //   const newStack = [...prev];
    //   newStack.pop();
    //   setLastVisible(newStack[newStack.length - 1] || null);
    //   return newStack;
    // });
    setCurrentPage((prev) => prev - 1);
  };

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setLastVisible(null);
    // setPageStack([null]);
    setCurrentPage(1);
  };

  // const formatDate = (date: Date) => {
  //   return new Intl.DateTimeFormat("en-US", {
  //     month: "short",
  //     day: "numeric",
  //     year: "numeric",
  //   }).format(date);
  // };

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

            {/* Items per page selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Rows per page:
              </span>
              <Select
                value={itemsPerPage.toString()}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setLastVisible(null);
                  // setPageStack([null]);
                  setCurrentPage(1);
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
          <ContactFlyover contact={contact} onClose={() => setSelectedContact(null)} open={!!contact}  />
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
              {filteredContacts.length > 0 ? (
                filteredContacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2 ml-4">
                        <GoogleAvatar path={contact.photoUrl} name={contact.name} />
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
                        const raw = contact.emails?.[0];
                        if (!raw)
                          return (
                            <span className="text-muted-foreground text-sm italic">
                              No email
                            </span>
                          );

                        const parts = raw.split(":");
                        const typesMatch = raw.match(/TYPE=([^:;]+)/i);
                        const types = typesMatch
                          ? typesMatch[1].split(",")
                          : [];
                        return (
                          <div>
                            <div className="font-medium">{parts[1]}</div>
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
                        const raw = contact.phone?.[0];
                        if (!raw)
                          return (
                            <span className="text-muted-foreground text-sm italic">
                              No phone
                            </span>
                          );

                        const parts = raw.split(":");
                        const typesMatch = raw.match(/TYPE=([^:;]+)/i);
                        const types = typesMatch
                          ? typesMatch[1].split(",")
                          : [];
                        return (
                          <div>
                            <div className="font-medium">{parts[1]}</div>
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
                        {contact.sources?.some((source) =>
                          source.toLowerCase().startsWith("carddav")
                        ) && (
                          <FontAwesomeIcon
                            icon={faEnvelope}
                            size="1x"
                            className="text-gray-500"
                          />
                        )}
                        {contact.sources?.some((source) =>
                          source.toLowerCase().startsWith("linkedin")
                        ) && (
                          <FontAwesomeIcon
                            icon={faLinkedin}
                            size="1x"
                            className="text-blue-700"
                          />
                        )}
                        {contact.sources?.some((source) =>
                          source.toLowerCase().startsWith("facebook")
                        ) && (
                          <FontAwesomeIcon
                            icon={faFacebook}
                            size="1x"
                            className=""
                          />
                        )}
                        {contact.sources?.some((source) =>
                          source.toLowerCase().includes("slack")
                        ) && (
                          <FontAwesomeIcon
                            icon={faSlack}
                            size="1x"
                            className="text-[#4A154B]"
                          />
                        )}
                      </div>
                    </TableCell>
                    {/* <TableCell className="hidden md:table-cell">
                      {contact.lastUpdated &&
                      !isNaN(new Date(contact.lastUpdated).getTime())
                        ? formatDate(contact.lastUpdated)
                        : "—"}
                    </TableCell> */}
                    <TableCell>

                      <Button
                        className="h-8 w-8 p-0"
                        onClick={() => setSelectedContact(contact)}
                      >
                        <FontAwesomeIcon
                          icon={faEllipsis}
                          fixedWidth
                          className="h-4 w-4"
                        />
                        <span className="sr-only">Open menu</span>
                      </Button>
                      
                      {/* <Dropdown>
                        <DropdownButton className="flex justify-center items-center h-8 cursor-pointer">
                          <FontAwesomeIcon
                            icon={faEllipsis}
                            fixedWidth
                            className=""
                          />
                          <span className="sr-only">Open menu</span>
                        </DropdownButton>
                        <DropdownMenu>
                          <DropdownItem className="cursor-pointer">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownItem>
                          <DropdownItem className="text-destructive cursor-pointer">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown> */}
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
            <Button
              outline
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              outline
              onClick={handleNextPage}
              disabled={isLastPage || filteredContacts.length === 0}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Pagination>
        </div>
      </main>
    </div>
  );
}

