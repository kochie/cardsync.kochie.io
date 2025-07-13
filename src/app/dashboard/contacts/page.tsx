"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Plus, EyeOff } from "lucide-react";
import { Contact } from "@/models/contacts";
import ContactFlyover from "@/components/ContactFlyover";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ContactsTable,
  ContactsFilters,
  ContactsPagination,
  AddContactDialog,
  useContactsData,
  useContactsFilters,
} from "@/components/ContactsPage";
import { hideContacts } from "@/actions/contacts/hide";
import toast from "react-hot-toast";

export default function ContactsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [, startTransition] = useTransition();

  // Custom hooks for data and filters
  const {
    contacts,
    availableConnections,
    isLastPage,
    isLoading,
    fetchContacts,
  } = useContactsData();

  const {
    currentPage,
    itemsPerPage,
    addressBook,
    searchQuery,
    debouncedSearchTerm,
    sortField,
    sortDirection,
    sourceFilter,
    setSearchQuery,
    setSourceFilter,
    setAddressBook,
    setItemsPerPage,
    handleSort,
    previousPage,
    nextPage,
  } = useContactsFilters();

  // State for selected contact and add contact dialog
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isAddContactDialogOpen, setIsAddContactDialogOpen] = useState(false);
  const [isNewContact, setIsNewContact] = useState(false);

  // State for contact selection
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());

  // Fetch contacts when filters change
  useEffect(() => {
    fetchContacts(
      currentPage,
      itemsPerPage,
      addressBook,
      debouncedSearchTerm ?? "",
      sortField,
      sortDirection,
      sourceFilter,
    );
  }, [
    fetchContacts,
    currentPage,
    itemsPerPage,
    addressBook,
    debouncedSearchTerm,
    sortField,
    sortDirection,
    sourceFilter,
  ]);

  // Handle contact selection from URL params
  useEffect(() => {
    if (searchParams.has("contactId")) {
      const contactId = searchParams.get("contactId");
      if (contactId) {
        const contact = contacts.find((c) => c.id === contactId);
        if (contact) {
          setSelectedContact(contact);
          return;
        }
      }
    }
    setSelectedContact(null);
    setIsNewContact(false);
  }, [contacts, searchParams]);

  const handleContactSelect = (contact: Contact) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      setSelectedContact(contact);
      params.set("contactId", contact.id);
      router.push(`?${params.toString()}`, { scroll: false });
    });
  };

  const handleContactClose = () => {
    const params = new URLSearchParams(window.location.search);
    params.delete("contactId");
    setIsNewContact(false);
    startTransition(() => {
      router.push(`?${params.toString()}`, { scroll: false });
    });
  };

  const handleContactCreated = (contactId: string) => {
    // Mark this as a new contact so it opens in edit mode
    setIsNewContact(true);
    
    // Refresh the contacts data to include the new contact
    fetchContacts(
      currentPage,
      itemsPerPage,
      addressBook,
      debouncedSearchTerm ?? "",
      sortField,
      sortDirection,
      sourceFilter,
    );
    
    // Open the flyover for the new contact
    const params = new URLSearchParams(searchParams);
    params.set("contactId", contactId);
    startTransition(() => {
      router.push(`?${params.toString()}`, { scroll: false });
    });
  };

  // Contact selection handlers
  const handleContactSelectionChange = (contactId: string, selected: boolean) => {
    const newSelected = new Set(selectedContacts);
    if (selected) {
      newSelected.add(contactId);
    } else {
      newSelected.delete(contactId);
    }
    setSelectedContacts(newSelected);
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedContacts(new Set(contacts.map(c => c.id)));
    } else {
      setSelectedContacts(new Set());
    }
  };

  const handleHideContacts = async () => {
    if (selectedContacts.size === 0) {
      toast.error("No contacts selected");
      return;
    }

    const result = await hideContacts(Array.from(selectedContacts));
    
    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success(`Hidden ${result.count} contact${result.count === 1 ? '' : 's'}`);
    setSelectedContacts(new Set());
    
    // Refresh the contacts data
    fetchContacts(
      currentPage,
      itemsPerPage,
      addressBook,
      debouncedSearchTerm ?? "",
      sortField,
      sortDirection,
      sourceFilter,
    );
  };

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 container py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              All Contacts
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage and view all your contacts across different sources
            </p>
          </div>
          <div className="flex items-center gap-3">
            {selectedContacts.size > 0 && (
              <Button
                outline
                onClick={handleHideContacts}
                className="flex items-center gap-2 text-red-600 border-red-600 hover:bg-red-50 dark:text-red-400 dark:border-red-400 dark:hover:bg-red-950/20"
              >
                <EyeOff className="h-4 w-4" />
                Hide {selectedContacts.size} Contact{selectedContacts.size === 1 ? '' : 's'}
              </Button>
            )}
            <Button 
              color="indigo"
              onClick={() => setIsAddContactDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
          </div>
        </div>

        {/* Filters */}
        <ContactsFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sourceFilter={sourceFilter}
          onSourceFilterChange={setSourceFilter}
          addressBook={addressBook}
          onAddressBookChange={setAddressBook}
          availableConnections={availableConnections}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={setItemsPerPage}
        />

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="text-sm text-muted-foreground">Loading contacts...</p>
            </div>
          </div>
        )}

        {/* Contacts Table */}
        {!isLoading && (
          <ContactsTable
            contacts={contacts}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
            onContactSelect={handleContactSelect}
            selectedContacts={selectedContacts}
            onContactSelectionChange={handleContactSelectionChange}
            onSelectAll={handleSelectAll}
          />
        )}

        {/* Pagination */}
        {!isLoading && (
          <ContactsPagination
            currentPage={currentPage}
            isLastPage={isLastPage}
            previousPage={previousPage()}
            nextPage={nextPage(isLastPage)}
          />
        )}

        {/* Contact Flyover */}
        <ContactFlyover
          contact={selectedContact}
          onClose={handleContactClose}
          initialEditMode={isNewContact}
        />

        {/* Add Contact Dialog */}
        <AddContactDialog
          isOpen={isAddContactDialogOpen}
          onClose={() => setIsAddContactDialogOpen(false)}
          onContactCreated={handleContactCreated}
          availableConnections={availableConnections}
        />
      </main>
    </div>
  );
}
