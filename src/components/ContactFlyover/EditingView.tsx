"use client";

import { Contact, ContactModel } from "@/models/contacts";
import SupabaseAvatar from "../SupabaseAvatar";
import { useState, useEffect } from "react";
import { useUser } from "@/app/context/userContext";
import LinkedinSelector from "./LinkedinSelector";
import InstagramSelector from "./InstagramSelector";
import SocialMediaPhotos from "./SocialMediaPhotos";
import SocialMediaEnrichment from "./SocialMediaEnrichment";
import { LinkedinContact } from "@/models/linkedinContact";
import { VCardProperty } from "@/utils/vcard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLinkedin } from "@fortawesome/free-brands-svg-icons";
import {
  faBuilding,
  faBirthdayCake,
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faBook,
  faClock,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { faChartNetwork } from "@fortawesome/pro-solid-svg-icons";
import { Divider } from "../ui/divider";
import toast from "react-hot-toast";
import { uploadImageToSupabase } from "@/utils/storage";
import { createClient } from "@/utils/supabase/client";
import GroupSelector from "./GroupSelector";
import EditableAddress from "./EditableAddress";
import EditableEmail from "./EditableEmail";
import EditablePhone from "./EditablePhone";
import Section from "../ui/section";
import GroupCard from "./GroupCard";
import { useRouter } from "next/navigation";

interface Group {
  id: string;
  name: string;
  memberCount?: number;
}

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
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const router = useRouter();

  // Birthday fields state
  const birthday = editableContact.birthday ? new Date(editableContact.birthday) : undefined;
  const [birthDay, setBirthDay] = useState(birthday ? birthday.getDate().toString().padStart(2, "0") : "");
  const [birthMonth, setBirthMonth] = useState(birthday ? (birthday.getMonth() + 1).toString().padStart(2, "0") : "");
  const [birthYear, setBirthYear] = useState(birthday && birthday.getFullYear() > 1900 ? birthday.getFullYear().toString() : "");

  // Groups state
  const [groups, setGroups] = useState<Group[]>([]);
  const supabase = createClient();

  // Fetch groups the contact is in
  useEffect(() => {
    if (!contact) return;
    supabase
      .from("carddav_group_members")
      .select(`group_id, carddav_groups (id, name, description, address_book)`)
      .eq("member_id", contact.id)
      .then(({ data, error }) => {
        if (error) {
          setGroups([]);
          return;
        }
        setGroups(
          (data ?? [])
            .map((gm: any) => gm.carddav_groups)
            .filter((g): g is { id: string; name: string } => g && typeof g.name === 'string' && g.name.length > 0)
            .map((g) => ({ id: g.id, name: g.name }))
        );
      });
  }, [contact, supabase]);

  async function onSave() {
    setIsSaving(true);
    try {
      // Compose birthday from fields
      let birthdayValue: Date | undefined = undefined;
      if (birthDay && birthMonth) {
        const year = birthYear ? birthYear : "1900";
        // Use UTC to avoid timezone issues
        birthdayValue = new Date(`${year}-${birthMonth}-${birthDay}T00:00:00Z`);
      }
      await saveContact(new Contact({
        ...editableContact,
        birthday: birthdayValue,
      }));
      toast.success("Contact saved successfully!");
    } catch (error) {
      toast.error("Failed to save contact");
      console.error("Error saving contact:", error);
    } finally {
      setIsSaving(false);
    }
  }

  const updateContact = (updates: Partial<ContactModel>) => {
    setEditableContact(prev => ({ ...prev, ...updates }));
  };

  const addAddress = () => {
    const newAddress = new VCardProperty("ADR", {}, ";;;;;;");
    updateContact({
      addresses: [...(editableContact.addresses || []), newAddress]
    });
  };

  const updateAddress = (index: number, address: VCardProperty) => {
    const newAddresses = [...(editableContact.addresses || [])];
    newAddresses[index] = address;
    updateContact({ addresses: newAddresses });
  };

  const removeAddress = (index: number) => {
    const newAddresses = [...(editableContact.addresses || [])];
    newAddresses.splice(index, 1);
    updateContact({ addresses: newAddresses });
  };

  const addEmail = () => {
    const newEmail = new VCardProperty("EMAIL", {}, "");
    updateContact({
      emails: [...(editableContact.emails || []), newEmail]
    });
  };

  const updateEmail = (index: number, email: VCardProperty) => {
    const newEmails = [...(editableContact.emails || [])];
    newEmails[index] = email;
    updateContact({ emails: newEmails });
  };

  const removeEmail = (index: number) => {
    const newEmails = [...(editableContact.emails || [])];
    newEmails.splice(index, 1);
    updateContact({ emails: newEmails });
  };

  const addPhone = () => {
    const newPhone = new VCardProperty("TEL", {}, "");
    updateContact({
      phones: [...(editableContact.phones || []), newPhone]
    });
  };

  const updatePhone = (index: number, phone: VCardProperty) => {
    const newPhones = [...(editableContact.phones || [])];
    newPhones[index] = phone;
    updateContact({ phones: newPhones });
  };

  const removePhone = (index: number) => {
    const newPhones = [...(editableContact.phones || [])];
    newPhones.splice(index, 1);
    updateContact({ phones: newPhones });
  };

  const [companyName, companyDept] = (editableContact.company || "").split(";");

  // Photo upload handler
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setIsUploadingPhoto(true);
    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = (event.target?.result as string)?.split(",")[1];
        if (!base64) return;
        const supabase = createClient();
        const path = `users/${user.id}/contacts/${contact.id}`.toLowerCase();
        await uploadImageToSupabase(path, base64, supabase);
        // Update avatar preview
        setAvatarUrl(`assets/${path}?t=${Date.now()}`); // cache bust
        toast.success("Photo uploaded!");

        // Generate and store blur placeholder
        try {
          const resp = await fetch("/api/generate-blur", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contactId: contact.id, imageBase64: base64 })
          });
          if (resp.ok) {
            const data = await resp.json();
            // Optionally update UI with new blur (forces re-render)
            setAvatarUrl(`assets/${path}?t=${Date.now()}`);
            router.refresh(); // Invalidate path after photo/blur update
          }
        } catch (err) {
          console.error("Failed to generate blur placeholder", err);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      toast.error("Failed to upload photo");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Handle photo applied from social media
  const handlePhotoApplied = () => {
    // Refresh the avatar to show the new photo
    setAvatarUrl(`assets/users/${user?.id}/contacts/${contact.id}?t=${Date.now()}`);
  };

  // Handle data enriched from social media
  const handleDataEnriched = (updates: {
    name?: string;
    title?: string;
    company?: string;
    emails?: string[];
    phones?: string[];
  }) => {
    const contactUpdates: Partial<ContactModel> = {
      name: updates.name,
      title: updates.title,
      company: updates.company,
    };

    if (updates.emails) {
      contactUpdates.emails = updates.emails.map(email => new VCardProperty("EMAIL", {}, email));
    }

    if (updates.phones) {
      contactUpdates.phones = updates.phones.map(phone => new VCardProperty("TEL", {}, phone));
    }

    updateContact(contactUpdates);
    router.refresh(); // Invalidate path after data edit
  };

  // Compute avatar path with cache busting if needed
  const avatarPath = (() => {
    let base = `users/${user?.id}/contacts/${contact.id}`.toLowerCase();
    if (avatarUrl) {
      base += `?t=${Date.now()}`;
    }
    return base;
  })();

  // Remove contact from group
  const handleRemoveGroup = async (groupId: string) => {
    const { error } = await supabase
      .from("carddav_group_members")
      .delete()
      .eq("member_id", contact.id)
      .eq("group_id", groupId)
      .eq("address_book", contact.addressBook.id);
    if (error) {
      toast.error("Failed to remove from group");
      return;
    }
    setGroups((prev) => prev.filter((g) => g.id !== groupId));
    toast.success("Removed from group");
  };

  return (
    <div className="max-w-3xl mx-auto px-1 py-6 sm:px-2 lg:px-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-8 justify-center">
        <div className="flex flex-col items-center sm:items-start w-full max-w-xs">
          <div className="relative group self-center">
            <SupabaseAvatar
              path={avatarPath}
              name={editableContact.name}
              blurDataURL={editableContact?.photoBlurUrl}
              className="rounded-full shadow-md ring-2 ring-blue-300 dark:ring-blue-700 w-28 h-28 object-cover cursor-pointer"
            />
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
              style={{ width: "100%", height: "100%" }}
              onChange={handlePhotoChange}
              disabled={isUploadingPhoto}
              title="Upload photo"
            />
            {isUploadingPhoto && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-full">
                <span className="text-blue-600 font-semibold">Uploading...</span>
              </div>
            )}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition">Upload</div>
          </div>
          <input
            type="text"
            value={editableContact.name}
            onChange={(e) => updateContact({ name: e.target.value })}
            className="text-3xl font-bold text-gray-900 dark:text-white mb-1 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none w-full max-w-xs mt-4"
            placeholder="Enter name"
          />
          <input
            type="text"
            value={editableContact.title || ""}
            onChange={(e) => updateContact({ title: e.target.value })}
            className="text-base font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none w-full max-w-xs"
            placeholder="Enter title"
          />
          {/* Social Media Photos row under name/title */}
          <div className="w-full flex flex-row justify-start mt-3">
            <SocialMediaPhotos
              contactId={editableContact.id}
              linkedinContactId={editableContact.linkedinContactId}
              linkedinContactMoniker={editableContact.linkedinContact}
              instagramContactId={editableContact.instagramContactId}
              instagramUsername={editableContact.instagramUsername}
              onPhotoApplied={handlePhotoApplied}
            />
          </div>
        </div>
      </div>

      {/* Company Section */}
      <Section icon={faBuilding} title="Company">
        <div className="space-y-2">
          <input
            type="text"
            value={companyName || ""}
            onChange={(e) => {
              const newCompany = companyDept ? `${e.target.value};${companyDept}` : e.target.value;
              updateContact({ company: newCompany });
            }}
            className="text-base text-gray-900 dark:text-gray-300 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none w-full"
            placeholder="Company name"
          />
          <input
            type="text"
            value={companyDept || ""}
            onChange={(e) => {
              const newCompany = companyName ? `${companyName};${e.target.value}` : e.target.value;
              updateContact({ company: newCompany });
            }}
            className="text-sm text-gray-500 dark:text-gray-400 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none w-full"
            placeholder="Department"
          />
        </div>
      </Section>
      <Divider soft className="my-4" />

      {/* Groups Section */}
      <Section icon={faBook} title="Groups">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4 mt-2">
          {groups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              onRemove={handleRemoveGroup}
              showRemoveButton={true}
            />
          ))}
        </div>
        <div className="relative mt-2">
          <GroupSelector
            addressBookId={contact.addressBook.id}
            existingGroups={groups}
            onAdd={async (group) => {
              // Add contact to group
              const { error: memberError } = await supabase
                .from("carddav_group_members")
                .upsert({
                  member_id: contact.id,
                  group_id: group.id,
                  address_book: contact.addressBook.id,
                });
              if (memberError) {
                toast.error("Failed to add to group");
                return;
              }
              setGroups((prev) => [...prev, group]);
              toast.success(`Added to group '${group.name}'`);
            }}
          />
        </div>
      </Section>
      <Divider soft className="my-4" />

      {/* Birthday Section */}
      <Section icon={faBirthdayCake} title="Birthday">
        <div className="flex gap-2 items-center">
          <input
            type="number"
            min={1}
            max={31}
            value={birthDay}
            onChange={e => setBirthDay(e.target.value.padStart(2, "0"))}
            placeholder="DD"
            className="w-14 text-base text-gray-900 dark:text-gray-300 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none"
          />
          <select
            value={birthMonth}
            onChange={e => setBirthMonth(e.target.value.padStart(2, "0"))}
            className="w-28 text-base text-gray-900 dark:text-gray-300 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none"
          >
            <option value="">Month</option>
            {[
              "01","02","03","04","05","06","07","08","09","10","11","12"
            ].map((m, i) => (
              <option key={m} value={m}>{new Date(2000, i, 1).toLocaleString("en-US", { month: "long" })}</option>
            ))}
          </select>
          <input
            type="number"
            min={1900}
            max={2100}
            value={birthYear}
            onChange={e => setBirthYear(e.target.value)}
            placeholder="YYYY (optional)"
            className="w-24 text-base text-gray-900 dark:text-gray-300 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </Section>
      <Divider soft className="my-4" />

      {/* Addresses Section */}
      <Section icon={faMapMarkerAlt} title="Addresses">
        {editableContact.addresses && editableContact.addresses.length > 0 ? (
          <ul className="space-y-3 mt-5 mx-2">
            {editableContact.addresses.map((address, index) => (
              <li
                key={index}
                className="flex flex-col md:flex-row items-start md:items-center justify-between rounded-md border border-gray-100 dark:border-gray-800 p-3 bg-gray-50 dark:bg-gray-800"
              >
                <EditableAddress 
                  address={address} 
                  onUpdate={(updatedAddress) => updateAddress(index, updatedAddress)}
                  onRemove={() => removeAddress(index)}
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-base text-gray-400">No addresses</p>
        )}
        <button
          onClick={addAddress}
          className="mt-2 flex items-center text-blue-600 hover:text-blue-800 text-sm"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-1" />
          Add Address
        </button>
      </Section>
      <Divider soft className="my-4" />

      {/* Emails Section */}
      <Section icon={faEnvelope} title="Emails">
        {editableContact.emails && editableContact.emails.length > 0 ? (
          <ul className="space-y-3 mt-5 mx-2">
            {editableContact.emails.map((email, index) => (
              <li
                key={index}
                className="rounded-md border border-gray-100 dark:border-gray-800 p-3 bg-gray-50 dark:bg-gray-800 flex flex-col md:flex-row md:items-center md:justify-between"
              >
                <EditableEmail 
                  email={email} 
                  onUpdate={(updatedEmail) => updateEmail(index, updatedEmail)}
                  onRemove={() => removeEmail(index)}
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-base text-gray-400">No emails</p>
        )}
        <button
          onClick={addEmail}
          className="mt-2 flex items-center text-blue-600 hover:text-blue-800 text-sm"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-1" />
          Add Email
        </button>
      </Section>
      <Divider soft className="my-4" />

      {/* Phones Section */}
      <Section icon={faPhone} title="Phone Numbers">
        {editableContact.phones && editableContact.phones.length > 0 ? (
          <ul className="space-y-3 mt-5 mx-2">
            {editableContact.phones.map((phone, index) => (
              <li
                key={index}
                className="rounded-md border border-gray-100 dark:border-gray-800 p-3 bg-gray-50 dark:bg-gray-800 flex flex-col md:flex-row md:items-center md:justify-between"
              >
                <EditablePhone 
                  phone={phone} 
                  onUpdate={(updatedPhone) => updatePhone(index, updatedPhone)}
                  onRemove={() => removePhone(index)}
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-base text-gray-400">No phone numbers</p>
        )}
        <button
          onClick={addPhone}
          className="mt-2 flex items-center text-blue-600 hover:text-blue-800 text-sm"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-1" />
          Add Phone
        </button>
      </Section>
      <Divider soft className="my-4" />

      {/* Social Connections Section */}
      <Section icon={faChartNetwork} title="Social Connections">
        <div className="flex flex-col gap-2">
          <div className="flex items-center">
            <FontAwesomeIcon icon={faLinkedin} className="mr-1 text-blue-600" />
            <LinkedinSelector
              defaultValue={selectedLinkedin}
              onSelect={(linkedinContact) => {
                if (linkedinContact) {
                  updateContact({
                    linkedinContact: linkedinContact.publicIdentifier,
                    linkedinContactId: linkedinContact.internalId,
                    linkedinUrn: linkedinContact.entityUrn,
                  });
                } else {
                  updateContact({
                    linkedinContact: undefined,
                    linkedinContactId: undefined,
                    linkedinUrn: undefined,
                  });
                }
              }}
            />
          </div>
          <div className="flex items-center mt-2">
            <InstagramSelector
              defaultValue={editableContact.instagramUsername ? {
                connectionId: editableContact.instagramConnectionId ?? "",
                userId: editableContact.instagramContactId ?? "",
                username: editableContact.instagramUsername,
                fullName: undefined,
                profilePicture: undefined,
                isPrivate: false,
                isVerified: false,
                followerCount: 0,
                followingCount: 0,
                mutualFollowers: [],
                followedByViewer: false,
                followsViewer: false,
                requestedByViewer: false,
              } : undefined}
              onSelect={(instagramContact) => {
                if (instagramContact) {
                  updateContact({
                    instagramUsername: instagramContact.username,
                    instagramContactId: instagramContact.internalId,
                  });
                } else {
                  updateContact({
                    instagramUsername: undefined,
                    instagramContactId: undefined,
                  });
                }
              }}
            />
          </div>
        </div>
      </Section>
      <Divider soft className="my-4" />

      {/* Social Media Enrichment Section */}
      <SocialMediaEnrichment
        contactId={editableContact.id}
        linkedinContactId={editableContact.linkedinContactId}
        linkedinContactMoniker={editableContact.linkedinContact}
        instagramContactId={editableContact.instagramContactId}
        instagramUsername={editableContact.instagramUsername}
        currentData={{
          name: editableContact.name,
          title: editableContact.title,
          company: editableContact.company,
          emails: editableContact.emails?.map(e => e.value) || [],
          phones: editableContact.phones?.map(p => p.value) || [],
        }}
        onDataEnriched={handleDataEnriched}
      />
      <Divider soft className="my-4" />

      {/* Notes Section */}
      <Section icon={faBook} title="Notes">
        <textarea
          value={editableContact.notes?.join('\n') || ""}
          onChange={(e) => updateContact({ notes: e.target.value.split('\n').filter(note => note.trim()) })}
          className="text-base text-gray-900 dark:text-gray-300 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none w-full min-h-[60px] resize-none"
          placeholder="Enter notes..."
        />
      </Section>
      <Divider soft className="my-4" />

      {/* Source Section */}
      <Section icon={faBook} title="Source">
        <p className="text-base text-blue-600 underline cursor-pointer hover:text-blue-800 dark:text-blue-400">
          {editableContact.addressBook.name || "Unknown"}
        </p>
      </Section>

      {/* Last Updated */}
      <div className="mt-2 flex items-center text-gray-500 dark:text-gray-400 text-sm">
        <FontAwesomeIcon icon={faClock} className="mr-2" />
        Last Updated:&nbsp;
        <span className="text-gray-900 dark:text-gray-300">
          {contact.lastUpdated
            ? new Date(contact.lastUpdated).toLocaleString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })
            : "—"}
        </span>
      </div>

      {/* Save Button */}
      <div className="mt-6 flex justify-center">
        <button
          disabled={isSaving}
          onClick={onSave}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
