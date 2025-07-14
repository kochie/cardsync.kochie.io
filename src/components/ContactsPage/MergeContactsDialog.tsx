import React from "react";
import { Dialog, DialogTitle, DialogDescription, DialogBody, DialogActions } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import SupabaseAvatar from "@/components/SupabaseAvatar";
import { Contact } from "@/models/contacts";
import { useUser } from "@/app/context/userContext";

interface MergeContactsDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  primaryContact: Contact;
  secondaryContacts: Contact[];
  mergedData: {
    emails: string[];
    phones: string[];
    // Add more fields as needed
  };
}

export default function MergeContactsDialog({
  open,
  onClose,
  onConfirm,
  primaryContact,
  secondaryContacts,
}: MergeContactsDialogProps) {
  // Only show the first secondary contact for now
  const secondaryContact = secondaryContacts[0];

  // Helper to get unique values from secondary not in primary
  const getNewValues = (primaryVals: string[], secondaryVals: string[]) => {
    return secondaryVals.filter(val => !primaryVals.includes(val));
  };

  const primaryEmails = primaryContact?.emails?.map(e => e.value) ?? [];
  const secondaryEmails = secondaryContact?.emails?.map(e => e.value) ?? [];
  const newEmails = getNewValues(primaryEmails, secondaryEmails);

  const primaryPhones = primaryContact?.phones?.map(p => p.value) ?? [];
  const secondaryPhones = secondaryContact?.phones?.map(p => p.value) ?? [];
  const newPhones = getNewValues(primaryPhones, secondaryPhones);

  const { user } = useUser();

  return (
    <Dialog open={open} onClose={onClose} size="4xl">
      <DialogTitle>Merge Contacts</DialogTitle>
      <DialogDescription>
        You are about to merge the following contacts:
      </DialogDescription>
      <DialogBody>
        <div className="flex gap-6 mb-4 justify-between">
          {/* Primary Contact Card */}
          <div className="border rounded-lg p-4 bg-muted/50 flex-1 grow-1">
            <div className="flex items-center gap-3 mb-2">
              <SupabaseAvatar
                path={`users/${user?.id}/contacts/${primaryContact.id}`.toLowerCase()}
                name={primaryContact.name ?? ""}
                blurDataURL={primaryContact.photoBlurUrl}
                className="w-10 h-10"
              />
              <div>
                <div className="font-medium">{primaryContact.name}</div>
                <div className="text-xs text-muted-foreground">{primaryContact.title ?? "No Title"}</div>
              </div>
            </div>
            <div className="mb-2">
              <div className="text-sm font-medium">Emails:</div>
              <ul className="list-disc ml-6">
                {primaryEmails.map(email => (
                  <li key={email}>{email}</li>
                ))}
                {newEmails.map(email => (
                  <li key={email} className="text-green-700 dark:text-green-400 font-semibold">+ {email}</li>
                ))}
              </ul>
            </div>
            <div className="mb-2">
              <div className="text-sm font-medium">Phones:</div>
              <ul className="list-disc ml-6">
                {primaryPhones.map(phone => (
                  <li key={phone}>{phone}</li>
                ))}
                {newPhones.map(phone => (
                  <li key={phone} className="text-green-700 dark:text-green-400 font-semibold">+ {phone}</li>
                ))}
              </ul>
            </div>
          </div>
          {/* Secondary Contact Card */}
          {secondaryContact && (
            <div className="border rounded-lg p-4 bg-muted/30 flex-1 grow-1">
              <div className="flex items-center gap-3 mb-2">
                <SupabaseAvatar
                  path={`users/${user?.id}/contacts/${secondaryContact.id}`.toLowerCase()}
                  name={secondaryContact.name ?? ""}
                  blurDataURL={secondaryContact.photoBlurUrl}
                  className="w-10 h-10"
                />
                <div>
                  <div className="font-medium">{secondaryContact.name}</div>
                  <div className="text-xs text-muted-foreground">{secondaryContact.title ?? "No Title"}</div>
                </div>
              </div>
              <div className="mb-2">
                <div className="text-sm font-medium">Emails:</div>
                <ul className="list-disc ml-6">
                  {secondaryEmails.map(email => (
                    <li key={email}>{email}</li>
                  ))}
                </ul>
              </div>
              <div className="mb-2">
                <div className="text-sm font-medium">Phones:</div>
                <ul className="list-disc ml-6">
                  {secondaryPhones.map(phone => (
                    <li key={phone}>{phone}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </DialogBody>
      <DialogActions>
        <Button plain onClick={onClose}>Cancel</Button>
        <Button color="dark/zinc" onClick={onConfirm}>Confirm Merge</Button>
      </DialogActions>
    </Dialog>
  );
} 