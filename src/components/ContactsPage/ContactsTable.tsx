"use client";

import { Contact } from "@/models/contacts";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEllipsis,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";
import { faInstagram, faLinkedin } from "@fortawesome/free-brands-svg-icons";
import SupabaseAvatar from "@/components/SupabaseAvatar";
import { getEmailTypeColor } from "@/utils/color/badgeColor";
import { useUser } from "@/app/context/userContext";
import { formatPhoneNumber, getCountryFlag, getCountryFromPhoneNumber } from "@/utils/phone/format";
import MergeContactsDialog from "./MergeContactsDialog";
import React from "react";

interface ContactsTableProps {
  contacts: Contact[];
  sortField: string;
  sortDirection: "asc" | "desc";
  onSort: (field: string) => void;
  onContactSelect: (contact: Contact) => void;
  selectedContactsMap: Map<string, Contact>;
  onContactSelectionChange: (contact: Contact, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onUnselectAll: () => void;
}

export default function ContactsTable({
  contacts,
  sortField,
  sortDirection,
  onSort,
  onContactSelect,
  selectedContactsMap,
  onContactSelectionChange,
  onSelectAll,
  onUnselectAll,
}: ContactsTableProps) {
  const { user } = useUser();
  const [mergeDialogOpen, setMergeDialogOpen] = React.useState(false);

  const allSelected = contacts.length > 0 && contacts.every(contact => selectedContactsMap.has(contact.id));
  const someSelected = contacts.some(contact => selectedContactsMap.has(contact.id));

  // Compute selected contacts
  const selectedContactsList = Array.from(selectedContactsMap.values());
  const primaryContact = selectedContactsList[0];
  const secondaryContacts = selectedContactsList.slice(1);

  // Compute merged data (emails, phones, etc.)
  const mergedData = React.useMemo(() => {
    if (!primaryContact) return { emails: [], phones: [] };
    const emails = new Set(primaryContact.emails?.map(e => e.value) ?? []);
    const phones = new Set(primaryContact.phones?.map(p => p.value) ?? []);
    for (const contact of secondaryContacts) {
      (contact.emails ?? []).forEach(e => emails.add(e.value));
      (contact.phones ?? []).forEach(p => phones.add(p.value));
    }
    return {
      emails: Array.from(emails),
      phones: Array.from(phones),
    };
  }, [primaryContact, secondaryContacts]);

  const handleMerge = () => {
    setMergeDialogOpen(true);
  };

  const handleMergeConfirm = () => {
    // TODO: Implement actual merge logic
    setMergeDialogOpen(false);
  };

  const handleMergeCancel = () => {
    setMergeDialogOpen(false);
  };

  const renderEmailCell = (contact: Contact) => {
    const email = contact.emails?.[0];
    if (!email) {
      return (
        <span className="text-muted-foreground text-sm italic">
          No email
        </span>
      );
    }

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
  };

  const renderPhoneCell = (contact: Contact) => {
    const phone = contact.phones?.[0];
    if (!phone) {
      return (
        <span className="text-muted-foreground text-sm italic">
          No phone
        </span>
      );
    }

    const types = phone.params["TYPE"] ?? [];
    const formattedNumber = formatPhoneNumber(phone.value);
    const countryCode = getCountryFromPhoneNumber(phone.value);
    const flag = countryCode ? getCountryFlag(countryCode) : '';
    
    return (
      <div>
        <div className="font-medium flex items-center gap-2">
          {flag && <span className="text-sm">{flag}</span>}
          {formattedNumber}
        </div>
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
  };

  const renderSourceCell = (contact: Contact) => (
    <div className="flex justify-center items-center gap-2">
      <FontAwesomeIcon
        icon={faEnvelope}
        size="1x"
        className="text-gray-500"
      />
      {contact.linkedinUser && (
        <FontAwesomeIcon
          icon={faLinkedin}
          size="1x"
          className="text-blue-700"
        />
      )}
      {contact.instagramUser && (
        <FontAwesomeIcon
          icon={faInstagram}
          size="1x"
          className="text-pink-700"
        />
      )}
    </div>
  );

  const SortButton = ({ field, children }: { field: string; children: React.ReactNode }) => (
    <button
      className="flex items-center gap-1 hover:text-primary transition-colors"
      onClick={() => onSort(field)}
    >
      {children}
      {sortField === field && (
        <ChevronDown
          className={`h-4 w-4 transition-transform ${
            sortDirection === "desc" ? "rotate-180" : ""
          }`}
        />
      )}
    </button>
  );

  return (
    <div className="rounded-md border">
      {/* Merge Button Toolbar */}
      <div className="flex items-center gap-2 p-2 border-b bg-muted">
        <Button
          color="dark/zinc"
          disabled={selectedContactsMap.size < 2}
          onClick={handleMerge}
        >
          Merge
        </Button>
        <Button
          plain
          disabled={selectedContactsMap.size === 0}
          onClick={onUnselectAll}
        >
          Unselect All
        </Button>
        {/* You can add more bulk actions here */}
      </div>
      {/* Merge Contacts Dialog */}
      {primaryContact && (
        <MergeContactsDialog
          open={mergeDialogOpen}
          onClose={handleMergeCancel}
          onConfirm={handleMergeConfirm}
          primaryContact={primaryContact}
          secondaryContacts={secondaryContacts}
          mergedData={mergedData}
        />
      )}
      {/* Table */}
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader className="w-[50px]">
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected && !allSelected}
                onChange={(checked) => onSelectAll(checked)}
                aria-label="Select all contacts"
              />
            </TableHeader>
            <TableHeader className="w-[250px]">
              <SortButton field="name">Name</SortButton>
            </TableHeader>
            <TableHeader>
              <SortButton field="email">Email</SortButton>
            </TableHeader>
            <TableHeader className="hidden md:table-cell">
              Phone
            </TableHeader>
            <TableHeader className="hidden lg:table-cell">
              Source
            </TableHeader>
            <TableHeader className="w-[70px]"></TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {contacts.length > 0 ? (
            contacts.map((contact) => (
              <TableRow 
                key={`${contact.id}-${contact.addressBook}`}
                className={`hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                  contact.hidden ? 'opacity-50' : ''
                }`}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedContactsMap.has(contact.id)}
                    onChange={(checked) => onContactSelectionChange(contact, checked)}
                    aria-label={`Select ${contact.name}`}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <SupabaseAvatar
                      path={`users/${user?.id}/contacts/${contact.id}`.toLowerCase()}
                      name={contact.name ?? ""}
                      blurDataURL={contact.photoBlurUrl}
                      className="w-10 h-10"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {contact.name}
                      </div>
                      <div className="text-xs text-muted-foreground hidden sm:block truncate">
                        {contact.title ?? "No Title"}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="align-top">
                  {renderEmailCell(contact)}
                </TableCell>
                <TableCell className="align-top hidden md:table-cell">
                  {renderPhoneCell(contact)}
                </TableCell>
                <TableCell className="hidden lg:table-cell text-center">
                  {renderSourceCell(contact)}
                </TableCell>
                <TableCell>
                  <Button
                    plain
                    className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => onContactSelect(contact)}
                  >
                    <FontAwesomeIcon
                      icon={faEllipsis}
                      fixedWidth
                      className="h-4 w-4"
                    />
                    <span className="sr-only">Open contact details</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                <div className="flex flex-col items-center justify-center text-gray-500">
                  <div className="text-lg font-medium mb-2">No contacts found</div>
                  <div className="text-sm">Try adjusting your search or filters</div>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
} 