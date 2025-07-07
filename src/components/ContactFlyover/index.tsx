"use client";

import { Contact, ContactModel } from "@/models/contacts";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { useEffect, useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLink, faUpload } from "@fortawesome/free-solid-svg-icons";
import { LinkedinContact } from "@/models/linkedinContact";
import { createClient } from "@/utils/supabase/client";

import { useUser } from "@/app/context/userContext";
import { cardDavSyncPush } from "@/actions/carddav/sync";
import { copyLinkedinDetails } from "@/utils/linkedin/duplicates";
import EditingView from "./EditingView";
import ReadView from "./ReadView";
import clsx from "clsx";


type ContactFlyoverProps = {
  contact: Contact | null;
  onClose: () => void;
};

export default function ContactFlyover({
  contact,
  onClose,
}: ContactFlyoverProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editableContact, setEditableContact] = useState<ContactModel | null>(
    null
  );

  const [selectedLinkedin, setSelectedLinkedin] = useState<
    LinkedinContact | undefined
  >(undefined);

  const supabase = createClient();

  const [open, setOpen] = useState(Boolean(contact));

  useEffect(() => {
    setOpen(Boolean(contact));
  }, [contact]);

  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  useEffect(() => {
    if (!contact?.linkedinContact) return;
    supabase
      .from("linkedin_contacts")
      .select()
      .eq("public_identifier", contact.linkedinContact)
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.error("Error fetching LinkedIn contact:", error);
          return;
        }

        if (data) {
          setSelectedLinkedin(LinkedinContact.fromDatabaseObject(data));
        } else {
          setSelectedLinkedin(undefined);
        }
      });
  }, [supabase, contact]);

  useEffect(() => {
    if (!contact) return;

    setEditableContact(contact.toModel());
  }, [contact, supabase]);

  async function pushToCardDavServer() {
    if (contact) await cardDavSyncPush(contact.addressBook.id, [contact.id]);
  }

  async function saveContact() {
    if (!editableContact) return;

    setIsSaving(true);
    const { error } = await supabase
      .from("carddav_contacts")
      .update(new Contact(editableContact).toDatabaseObject())
      .eq("id", editableContact.id);

    if (error) {
      console.error("Error saving contact:", error);
      setIsSaving(false);
      return;
    }

    setIsSaving(false);
  }

  const { user } = useUser();

  if (!contact || !user) return null;

  return (
    <Dialog transition className="relative z-50" onClose={handleClose} open={open}>
      <DialogBackdrop transition className={clsx("fixed inset-0 bg-black/30",
            'data-closed:opacity-0',
            // Entering styles
            'data-enter:duration-500 data-enter:data-closed:opacity-100',
            // Leaving styles
            'data-leave:duration-500 data-leave:data-closed:opacity-0', 
      )} />

      <div className="fixed inset-0 flex justify-end">
        <DialogPanel
          transition
          className={clsx("duration-300 my-2 w-screen max-w-lg bg-white shadow-xl p-6 overflow-y-auto ease-out rounded-lg",
            // 'data-closed:opacity-0',
            // Entering styles
            'data-enter:duration-300 data-enter:data-closed:translate-x-full',
            // Leaving styles
            'data-leave:duration-300 data-leave:data-closed:translate-x-full',
          )}
        >
          <div className="flex justify-between items-center mb-4">
            <button onClick={pushToCardDavServer}>
              <FontAwesomeIcon icon={faUpload} className="" />
            </button>
            <button
              onClick={() => {
                copyLinkedinDetails(contact.id, contact.addressBook.id);
              }}
            >
              <FontAwesomeIcon icon={faLink} className="" />
            </button>
            <button
              onClick={() => setIsEditing((prev) => !prev)}
              className="text-sm text-blue-500 hover:text-blue-700"
            >
              {isEditing ? "Cancel" : "Edit"}
            </button>
            <button
              onClick={handleClose}
              className="text-sm text-gray-500 hover:text-gray-800"
            >
              Close
            </button>
          </div>

          {isEditing ? (
            <EditingView
              contact={contact}
              saveContact={saveContact}
              selectedLinkedin={selectedLinkedin}
            />
          ) : (
            <ReadView contact={contact} />
          )}
        </DialogPanel>
      </div>
    </Dialog>
  );
}
