"use client";

import { Contact, ContactModel } from "@/models/contacts";
import SupabaseAvatar from "../SupabaseAvatar";
import { useState } from "react";
import { useUser } from "@/app/context/userContext";
import LinkedinSelector from "./LinkedinSelector";
import { LinkedinContact } from "@/models/linkedinContact";

export default function EditingView({
  contact,
  saveContact,
  selectedLinkedin,
}: {
  contact: Contact;
  selectedLinkedin?: LinkedinContact;
  saveContact: (contact: Contact) => Promise<void>;
}) {
  const [editableContact, setEditableContact] = useState<ContactModel>(
    contact.toModel()
  );
  const { user } = useUser();
  const [isSaving, setIsSaving] = useState(false);

  async function onSave() {
    setIsSaving(true);

    try {
      await saveContact(new Contact(editableContact));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div>
      <div className="space-y-2">
        <SupabaseAvatar
          path={`users/${user?.id}/contacts/${contact.id}`.toLowerCase()}
          name={editableContact.name}
          blurDataURL={editableContact?.photoBlurUrl}
        />

        <div className="text-sm text-gray-700">
          <strong>Title:</strong>{" "}
          {
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
          }
        </div>
        <div className="text-sm text-gray-700">
          <strong>Company:</strong>{" "}
          {
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
          }
        </div>

        <div>
          <p className="font-semibold text-sm">Birthday:</p>
          <div className="text-sm text-gray-700">
            {
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
            }
          </div>
        </div>

        <div>
          <p className="font-semibold text-sm">Address:</p>
          <ul className="text-sm text-gray-700">
            {editableContact?.addresses?.map((address, i) => {
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
            {editableContact?.emails?.map((e, i) => {
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
            })}
          </ul>
        </div>
        <div>
          <p className="font-semibold text-sm">Phone Numbers:</p>
          <ul className="space-y-2">
            {editableContact?.phones?.map((p, i) => {
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
            })}
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
        <LinkedinSelector
          defaultValue={selectedLinkedin}
          onSelect={(linkedinContact) => {
            contact.setLinkedinContact(linkedinContact);
          }}
        />
        <div className="mt-4">
          <button
            disabled={isSaving}
            onClick={onSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
