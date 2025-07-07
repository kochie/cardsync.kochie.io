"use client";

import { Contact } from "@/models/contacts";
import SupabaseAvatar from "../SupabaseAvatar";
import { useUser } from "@/app/context/userContext";
import { VCardProperty } from "@/utils/vcard";
import { Badge } from "../ui/badge";

export default function ReadView({ contact }: { contact: Contact }) {
  const { user } = useUser();

  // console.log("ReadView contact:", contact);

  return (
    <div className="max-w-xl mx-auto px-1 py-6 sm:px-2 lg:px-2">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{contact.name}</h2>
      </div>
      <div className="flex justify-center mb-4">
        <SupabaseAvatar
          path={`users/${user?.id}/contacts/${contact.id}`.toLowerCase()}
          name={contact.name}
          blurDataURL={contact.photoBlurUrl}
          className="rounded-full shadow-md ring-2 ring-gray-200 dark:ring-gray-700"
        />
      </div>
      <div className="space-y-6">
        <div>
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Title</p>
          <p className="text-base text-gray-900 dark:text-gray-300">{contact.title || "—"}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Company</p>
          <p className="text-base text-gray-900 dark:text-gray-300">{contact.company || "—"}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Birthday</p>
          <p className="text-base text-gray-900 dark:text-gray-300">
            {(() => {
              if (!contact.birthday) return "—";
              const date = new Date(contact.birthday);
              if (date.getFullYear() <= 1900) {
                return date.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                });
              }
              return date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              });
            })()}
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Addresses</p>
          {contact.addresses.length > 0 ? (
            <ul className="space-y-3">
              {contact.addresses.map((address, i) => (
                <li key={i} className="rounded-md border border-gray-200 dark:border-gray-700 p-3">
                  <Address address={address} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-base text-gray-900 dark:text-gray-300">No addresses</p>
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Emails</p>
          {contact.emails.length > 0 ? (
            <ul className="space-y-3">
              {contact.emails.map((e, i) => {
                const types = Array.from(new Set(e.params["TYPE"])) ?? [];
                return (
                  <li key={i} className="rounded-md border border-gray-200 dark:border-gray-700 p-3">
                    <div className="text-base font-medium text-gray-900 dark:text-gray-200">
                      {e.value}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {types.map((type) => (
                        <Badge key={type} className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-base text-gray-900 dark:text-gray-300">No emails</p>
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Phone Numbers</p>
          {contact.phones && contact.phones.length > 0 ? (
            <ul className="space-y-3">
              {contact.phones.map((p, i) => {
                const types = p.params["TYPE"] ?? [];
                return (
                  <li key={i} className="rounded-md border border-gray-200 dark:border-gray-700 p-3">
                    <div className="text-base font-medium text-gray-900 dark:text-gray-200">
                      {p.value}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {types.map((type) => (
                        <Badge key={type} className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-base text-gray-900 dark:text-gray-300">No phone numbers</p>
          )}
        </div>
        <hr className="my-6 border-gray-200 dark:border-gray-700" />
        <div className="space-y-2">
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Source</p>
            <p className="text-base text-gray-900 dark:text-gray-300">{contact.addressBook.name || "Unknown"}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">LinkedIn</p>
            <p className="text-base text-gray-900 dark:text-gray-300">
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
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Last Updated</p>
            <p className="text-base text-gray-900 dark:text-gray-300">
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
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Address({ address }: { address: VCardProperty }) {
  const [pobox, extendedAddress, street, city, region, postalCode, country] =
    address.value.split(";");

  return (
    <div className="text-base text-gray-900 dark:text-gray-300">
      {pobox && <div>{pobox}</div>}
      {(extendedAddress || street) && (
        <div>
          {extendedAddress && <span>{extendedAddress} </span>}
          {street}
        </div>
      )}
      {(city || region || postalCode) && (
        <div>
          {city && <span>{city}, </span>}
          {region && <span>{region} </span>}
          {postalCode}
        </div>
      )}
      {country && <div>{country}</div>}

      {address.params["TYPE"]?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {address.params["TYPE"].map((type) => (
            <Badge key={type} className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
              {type}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
