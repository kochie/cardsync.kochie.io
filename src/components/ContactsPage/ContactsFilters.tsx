"use client";

import { Input, InputGroup } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Filter, Download } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";

interface AddressBookConnection {
  id: string;
  displayName: string;
  connectionName: string;
  connectionId: string;
}

interface ContactsFiltersProps {
  searchQuery: string | null;
  onSearchChange: (value: string) => void;
  sourceFilter: string;
  onSourceFilterChange: (value: string) => void;
  addressBook: string | null;
  onAddressBookChange: (value: string) => void;
  availableConnections: AddressBookConnection[];
  itemsPerPage: number;
  onItemsPerPageChange: (value: number) => void;
}

export default function ContactsFilters({
  searchQuery,
  onSearchChange,
  sourceFilter,
  onSourceFilterChange,
  addressBook,
  onAddressBookChange,
  availableConnections,
  itemsPerPage,
  onItemsPerPageChange,
}: ContactsFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6 items-start md:items-center justify-between">
      <InputGroup className="w-full md:w-auto">
        <FontAwesomeIcon icon={faSearch} className="" data-slot="icon" />
        <Input
          name="search"
          placeholder="Search contacts..."
          aria-label="Search contacts"
          onChange={(e) => onSearchChange(e.target.value)}
          value={searchQuery ?? ""}
          className="w-full md:w-80"
        />
      </InputGroup>

      <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select
            value={sourceFilter}
            onChange={(e) => onSourceFilterChange(e.target.value)}
            className="min-w-32"
          >
            <option value="all">All Sources</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="Instagram">Instagram</option>
            <option value="Facebook">Facebook</option>
            <option value="Slack">Slack</option>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            Address Book:
          </span>
          <Select
            onChange={(e) => onAddressBookChange(e.target.value)}
            value={addressBook ?? ""}
            className="min-w-48"
          >
            <option value="">All Address Books</option>
            {availableConnections.map((conn) => (
              <option key={conn.id} value={conn.id}>
                {conn.displayName} - {conn.connectionName}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            Per page:
          </span>
          <Select
            value={itemsPerPage.toString()}
            onChange={(e) => onItemsPerPageChange(parseInt(e.target.value))}
            className="min-w-20"
          >
            {[10, 25, 50, 100].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </Select>
        </div>

        <Button color="indigo">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>
    </div>
  );
} 