"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { createContact } from "@/actions/contacts/create";
import { useUser } from "@/app/context/userContext";
import toast from "react-hot-toast";

interface AddressBookConnection {
  id: string;
  displayName: string;
  connectionName: string;
  connectionId: string;
}

interface AddContactDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onContactCreated: (contactId: string) => void;
  availableConnections: AddressBookConnection[];
}

export default function AddContactDialog({
  isOpen,
  onClose,
  onContactCreated,
  availableConnections,
}: AddContactDialogProps) {
  const { user } = useUser();
  const [selectedAddressBook, setSelectedAddressBook] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateContact = async () => {
    if (!selectedAddressBook || !user) {
      toast.error("Please select an address book");
      return;
    }

    setIsCreating(true);
    try {
      const result = await createContact(user.id, selectedAddressBook);
      
      if (result.success && result.contactId) {
        toast.success("Contact created successfully!");
        onContactCreated(result.contactId);
        onClose();
        setSelectedAddressBook("");
      } else {
        toast.error(result.error || "Failed to create contact");
      }
    } catch (error) {
      console.error("Error creating contact:", error);
      toast.error("Failed to create contact");
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    if (!isCreating) {
      setSelectedAddressBook("");
      onClose();
    }
  };

  if (availableConnections.length === 0) {
    return (
      <Dialog open={isOpen} onClose={handleClose}>
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={handleClose} />
          <div className="relative bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold mb-4">No Address Books Available</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              You need to add a CardDAV connection first before creating contacts.
            </p>
            <div className="flex justify-end">
              <Button onClick={handleClose}>Close</Button>
            </div>
          </div>
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onClose={handleClose}>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="fixed inset-0 bg-black/50" onClick={handleClose} />
        <div className="relative bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
          <h2 className="text-lg font-semibold mb-4">Create New Contact</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Select an address book where you want to create the new contact.
          </p>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Address Book
            </label>
            <Select
              value={selectedAddressBook}
              onChange={(e) => setSelectedAddressBook(e.target.value)}
              disabled={isCreating}
            >
              <option value="">Select an address book...</option>
              {availableConnections.map((conn) => (
                <option key={conn.id} value={conn.id}>
                  {conn.displayName} - {conn.connectionName}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              outline
              onClick={handleClose}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateContact}
              disabled={!selectedAddressBook || isCreating}
            >
              {isCreating ? "Creating..." : "Create Contact"}
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
} 