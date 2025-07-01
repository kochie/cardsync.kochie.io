"use client";

import { Contact, ContactModel } from "@/models/contacts";
import { Dialog, DialogPanel } from "@headlessui/react";
import SupabaseAvatar from "../SupabaseAvatar";
import { useEffect, useState } from "react";

import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Label,
} from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faLink,
  faUpDown,
  faUpload,
} from "@fortawesome/free-solid-svg-icons";
import { LinkedinContact } from "@/models/linkedinContact";
import Image from "next/image";
import { useDebounce } from "@uidotdev/usehooks";
import { createClient } from "@/utils/supabase/client";

import { useUser } from "@/app/context/userContext";
import { cardDavSyncPush } from "@/actions/carddav/sync";
import { copyLinkedinDetails } from "@/utils/linkedin/duplicates";

type ContactFlyoverProps = {
  contact: Contact | null;
  open: boolean;
  onClose: () => void;
};

export default function ContactFlyover({
  contact,
  open,
  onClose,
}: ContactFlyoverProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editableContact, setEditableContact] = useState<ContactModel | null>(
    null
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [linkedinContacts, setLinkedinContacts] = useState<LinkedinContact[]>(
    []
  );
  const [selectedLinkedIn, setSelectedLinkedIn] =
    useState<LinkedinContact | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const supabase = createClient();

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
          setSelectedLinkedIn(LinkedinContact.fromDatabaseObject(data));
        } else {
          setSelectedLinkedIn(null);
        }
      });
  }, [supabase, contact]);

  useEffect(() => {
    if (!debouncedSearchTerm) return;

    const fetchLinkedinContacts = async () => {
      const lower = debouncedSearchTerm.toLowerCase();

      console.log("Fetching LinkedIn contacts for:", lower);

      const { data, error } = await supabase
        .from("linkedin_contacts")
        .select("*")
        .ilike("full_name", `%${lower}%`)
        .limit(30)
        .order("full_name", { ascending: true });

      if (error) {
        console.error("Error fetching LinkedIn contacts:", error);
        return;
      }

      console.log("Found LinkedIn contacts:", data);
      setLinkedinContacts(
        data.map((item) => LinkedinContact.fromDatabaseObject(item))
      );
    };
    fetchLinkedinContacts();
  }, [debouncedSearchTerm, supabase]);

  useEffect(() => {
    if (!contact) return;

    // const fetchSources = async () => {
    //   const { data, error } = await supabase
    //     .from("carddav_connections")
    //     .select("name")
    //     .eq("id", contact.conectionId)
    //     .single();

    //   if (error) {
    //     console.error("Error fetching CardDAV connection name:", error);
    //     return;
    //   }

    //   setSourceName(data.name);
    // };

    // fetchSources();
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
    <Dialog as="div" className="relative z-50" onClose={onClose} open={open}>
      <div className="fixed inset-0 flex justify-end">
        <DialogPanel
          className="my-2 w-screen max-w-lg bg-white shadow-xl p-6 overflow-y-auto duration-1000 ease-out data-closed:transform-[scale(95%)] data-closed:translate-x-full data-closed:opacity-0 data-open:transform-none data-open:translate-x-0 data-open:opacity-100 rounded-lg"
          transition
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {isEditing ? editableContact?.name : contact.name}
            </h2>
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
              onClick={onClose}
              className="text-sm text-gray-500 hover:text-gray-800"
            >
              Close
            </button>
          </div>
          <div className="space-y-2">
            <SupabaseAvatar
              path={
                isEditing
                  ? `users/${user.id}/contacts/${contact.id}`
                  : `users/${user.id}/contacts/${contact.id}`
              }
              name={
                isEditing ? editableContact?.name ?? "" : contact.name ?? ""
              }
              blurDataURL={
                isEditing ? editableContact?.photoBlurUrl : contact.photoBlurUrl
              }
            />

            <div className="text-sm text-gray-700">
              <strong>Title:</strong>{" "}
              {isEditing ? (
                <input
                  type="text"
                  value={editableContact?.title || ""}
                  onChange={(e) =>
                    setEditableContact(
                      (prev) => prev && { ...prev, title: e.target.value }
                    )
                  }
                  className="border border-gray-300 rounded px-2 py-0.5 text-sm"
                />
              ) : (
                contact.title || "—"
              )}
            </div>
            <div className="text-sm text-gray-700">
              <strong>Company:</strong>{" "}
              {isEditing ? (
                <input
                  type="text"
                  value={editableContact?.company || ""}
                  onChange={(e) =>
                    setEditableContact(
                      (prev) => prev && { ...prev, company: e.target.value }
                    )
                  }
                  className="border border-gray-300 rounded px-2 py-0.5 text-sm"
                />
              ) : (
                contact.company || "—"
              )}
            </div>

            <div>
              <p className="font-semibold text-sm">Birthday:</p>
              <div className="text-sm text-gray-700">
                {isEditing ? (
                  <input
                    type="date"
                    value={
                      editableContact?.birthday
                        ? (() => {
                            const date = new Date(editableContact.birthday);
                            // If year is 1900, only show MM-DD as a string (for type="date" we need a full date, so keep year 1900)
                            // But browsers require yyyy-MM-dd for type="date"
                            // So, just use the date as is, but show MM-DD if year is 1900
                            // For type="date" input, it must be yyyy-MM-dd, so we'll use 1900-MM-DD if year unknown
                            return date.toISOString().split("T")[0];
                          })()
                        : ""
                    }
                    onChange={(e) =>
                      setEditableContact(
                        (prev) =>
                          prev && {
                            ...prev,
                            birthDate: new Date(e.target.value).toISOString(),
                          }
                      )
                    }
                    className="border border-gray-300 rounded px-2 py-0.5 text-sm"
                  />
                ) : (
                  (() => {
                    if (!contact.birthday) return "—";
                    const date = new Date(contact.birthday);
                    if (date.getFullYear() === 1900) {
                      return (
                        date.toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                        }) + " (year unknown)"
                      );
                    }
                    return date.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    });
                  })()
                )}
              </div>
            </div>

            <div>
              <p className="font-semibold text-sm">Address:</p>
              <ul className="text-sm text-gray-700">
                {(isEditing
                  ? editableContact?.addresses
                  : contact.addresses
                )?.map((address, i) => {
                  return (
                    <li key={i} className="mb-2">
                      <div className="text-sm font-medium text-gray-800">
                        {address.value}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(address.params["TYPE"] ?? []).map((type) => (
                          <span
                            key={type}
                            className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded"
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div>
              <p className="font-semibold text-sm">Emails:</p>
              <ul className="space-y-2">
                {(isEditing ? editableContact?.emails : contact.emails)?.map(
                  (e, i) => {
                    const types = Array.from(new Set(e.params["TYPE"])) ?? [];
                    return (
                      <li key={i}>
                        <div className="text-sm font-medium text-gray-800">
                          {e.value}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {types.map((type) => (
                            <span
                              key={type}
                              className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded"
                            >
                              {type}
                            </span>
                          ))}
                        </div>
                      </li>
                    );
                  }
                )}
              </ul>
            </div>
            <div>
              <p className="font-semibold text-sm">Phone Numbers:</p>
              <ul className="space-y-2">
                {(isEditing ? editableContact?.phones : contact.phones)?.map(
                  (p, i) => {
                    const types = p.params["TYPE"] ?? [];
                    return (
                      <li key={i}>
                        <div className="text-sm font-medium text-gray-800">
                          {p.value}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {types.map((type) => (
                            <span
                              key={type}
                              className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded"
                            >
                              {type}
                            </span>
                          ))}
                        </div>
                      </li>
                    );
                  }
                )}
              </ul>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              <strong>Source:</strong> {contact.addressBook.name || "Unknown"}
            </p>
            <p>
              <strong>LinkedIn:</strong>{" "}
              {contact.linkedinContact ? (
                <a
                  href={`https://www.linkedin.com/in/${contact.linkedinContact}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {contact.linkedinContact}
                </a>
              ) : (
                "—"
              )}
            </p>
            <p>
              <strong>Last Updated:</strong>{" "}
              {contact.lastUpdated
                ? new Date(contact.lastUpdated).toLocaleString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                    // timeZone: "",
                  })
                : "—"}
            </p>
            {isEditing && (
              <>
                <div>
                  <Combobox
                    as="div"
                    value={selectedLinkedIn}
                    onChange={(person) => {
                      setSearchTerm("");
                      setSelectedLinkedIn(person);
                    }}
                  >
                    <Label className="block text-sm font-medium text-gray-900">
                      LinkedIn Contact
                    </Label>
                    <div className="relative mt-2">
                      <ComboboxInput
                        className="block w-full rounded-md bg-white py-1.5 pl-3 pr-12 text-base text-gray-900 outline -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm"
                        onChange={(event) => setSearchTerm(event.target.value)}
                        displayValue={(person: LinkedinContact) =>
                          `${person?.firstName} ${person?.lastName}`
                        }
                      />
                      <ComboboxButton className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
                        <FontAwesomeIcon
                          icon={faUpDown}
                          className="size-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </ComboboxButton>

                      {linkedinContacts.length > 0 && (
                        <ComboboxOptions className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                          {linkedinContacts.map((person) => (
                            <ComboboxOption
                              key={person.publicIdentifier}
                              value={person}
                              className="group relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 data-[focus]:bg-indigo-600 data-[focus]:text-white data-[focus]:outline-none"
                            >
                              <div className="flex items-center">
                                {person.profilePicture && (
                                  <Image
                                    width={24}
                                    height={24}
                                    src={person.profilePicture}
                                    alt=""
                                    className="size-6 shrink-0 rounded-full"
                                  />
                                )}
                                <span className="ml-3 truncate group-data-[selected]:font-semibold">
                                  {person.firstName} {person.lastName}
                                </span>
                              </div>

                              <span className="absolute inset-y-0 right-0 hidden items-center pr-4 text-indigo-600 group-data-[selected]:flex group-data-[focus]:text-white">
                                <FontAwesomeIcon
                                  icon={faCheck}
                                  className="size-5"
                                  aria-hidden="true"
                                />
                              </span>
                            </ComboboxOption>
                          ))}
                        </ComboboxOptions>
                      )}
                    </div>
                  </Combobox>
                </div>
                <div className="mt-4">
                  <button
                    disabled={isSaving}
                    onClick={() => {
                      // implement save logic here, e.g., call a prop or backend API
                      setIsEditing(false);
                      saveContact();
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Save
                  </button>
                </div>
              </>
            )}
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
