"use client";

import { Contact } from "@/models/contacts";
import SupabaseAvatar from "../SupabaseAvatar";
import { useUser } from "@/app/context/userContext";
import { VCardProperty } from "@/utils/vcard";
import { Badge, BadgeProps } from "../ui/badge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLinkedin } from "@fortawesome/free-brands-svg-icons";
import { faInstagram } from "@fortawesome/free-brands-svg-icons";
import {
  faCopy,
  faBuilding,
  faBirthdayCake,
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faBook,
  faClock,
  faExternalLinkAlt,
  faHome,
  faMobile,
} from "@fortawesome/free-solid-svg-icons";
import { faChartNetwork } from "@fortawesome/pro-solid-svg-icons";
import Image from "next/image";
import Link from "next/link";
import { Divider } from "../ui/divider";
import toast from "react-hot-toast";
import Section from "../ui/section";
import GroupCard from "./GroupCard";
import { formatPhoneNumber, getCountryFlag, getCountryFromPhoneNumber } from "@/utils/phone/format";

function CopyButton({ value, label }: { value: string; label: string }) {
  return (
    <button
      aria-label={`Copy ${label}`}
      className="ml-2 text-gray-400 hover:text-blue-500 focus:outline-none cursor-pointer"
      onClick={() => {
        navigator.clipboard.writeText(value);
        toast.success(
          `${label.charAt(0).toUpperCase() + label.slice(1)} copied!`,
        );
      }}
      tabIndex={0}
    >
      <FontAwesomeIcon icon={faCopy} />
      <span className="sr-only">Copy {label}</span>
    </button>
  );
}

export default function ReadView({ contact, groups }: { contact: Contact, groups?: { id: string, name: string, description?: string, address_book?: string }[] }) {
  const { user } = useUser();
  const [companyName, companyDept] = (contact.company || "").split(";");

  return (
    <div className="max-w-3xl mx-auto px-1 py-6 sm:px-2 lg:px-2">
      {/* Header */}
      <div className="flex items-center space-x-6 mb-8 justify-center">
        <SupabaseAvatar
          path={`users/${user?.id}/contacts/${contact.id}`.toLowerCase()}
          name={contact.name}
          blurDataURL={contact.photoBlurUrl}
          className="rounded-full shadow-md ring-2 ring-blue-300 dark:ring-blue-700 w-28 h-28"
        />
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {contact.name}
          </h2>
          <p className="text-base font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {contact.title || "—"}
          </p>
        </div>
      </div>

      <Section icon={faBuilding} title="Company">
        <p className="text-base text-gray-900 dark:text-gray-300">
          {companyName || "—"}
        </p>
        {companyDept && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {companyDept}
          </p>
        )}
      </Section>
      {groups && groups.length > 0 && (
        <>
          <Divider soft className="my-4" />
          <Section icon={faBook} title="Groups">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
              {groups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  showRemoveButton={false}
                />
              ))}
            </div>
          </Section>
        </>
      )}
      <Divider soft className="my-4" />
      <Section icon={faBirthdayCake} title="Birthday">
        <p className="text-base text-gray-900 dark:text-gray-300">
          {(() => {
            if (!contact.birthday) return "—";
            const date = new Date(contact.birthday);
            if (date.getFullYear() <= 1900) {
              return (
                <span className="text-base text-gray-900 dark:text-gray-300">
                  {date.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              );
            }
            const dateString = date.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            });
            const age = new Date().getFullYear() - date.getFullYear();
            return (
              <span className="text-base text-gray-900 dark:text-gray-300">
                {dateString}{" "}
                <span className="font-semibold text-gray-400">({age})</span>
              </span>
            );
          })()}
        </p>
      </Section>
      <Divider soft className="my-4" />

      {/* Addresses */}
      <Section icon={faMapMarkerAlt} title="Addresses">
        {contact.addresses.length > 0 ? (
          <ul className="space-y-3 mt-5 mx-2">
            {contact.addresses.map((address) => (
              <li
                key={address.value}
                className="flex flex-col md:flex-row items-start md:items-center justify-between rounded-md border border-gray-100 dark:border-gray-800 p-3 bg-gray-50 dark:bg-gray-800"
              >
                <Address address={address} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-base text-gray-400">No addresses</p>
        )}
      </Section>
      <Divider soft className="my-4" />

      {/* Emails */}
      <Section icon={faEnvelope} title="Emails">
        {contact.emails.length > 0 ? (
          <ul className="space-y-3 mt-5 mx-2">
            {contact.emails.map((email) => {
              return (
                <li
                  key={email.value}
                  className="rounded-md border border-gray-100 dark:border-gray-800 p-3 bg-gray-50 dark:bg-gray-800 flex flex-col md:flex-row md:items-center md:justify-between"
                >
                  <Email email={email} />
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-base text-gray-400">No emails</p>
        )}
      </Section>
      <Divider soft className="my-4" />
      {/* Phones */}
      <Section icon={faPhone} title="Phone Numbers">
        {contact.phones && contact.phones.length > 0 ? (
          <ul className="space-y-3 mt-5 mx-2">
            {contact.phones.map((phone) => {
              return (
                <li
                  key={phone.value}
                  className="rounded-md border border-gray-100 dark:border-gray-800 p-3 bg-gray-50 dark:bg-gray-800 flex flex-col md:flex-row md:items-center md:justify-between"
                >
                  <Phone phone={phone} />
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-base text-gray-400">No phone numbers</p>
        )}
      </Section>
      <Divider soft className="my-4" />

      {/* Source, LinkedIn, Last Updated */}
      <Section icon={faChartNetwork} title="Social Connections">
        <div className="flex flex-col gap-2">
          {/* LinkedIn */}
          <div className="flex items-center">
            <FontAwesomeIcon icon={faLinkedin} className="mr-1 text-blue-600" />
            {contact.linkedinContact ? (
              <a
                href={`https://www.linkedin.com/in/${contact.linkedinContact}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-base text-blue-600 hover:underline flex items-center"
              >
                {contact.linkedinContact}
                <FontAwesomeIcon
                  icon={faExternalLinkAlt}
                  className="ml-1 text-xs"
                />
              </a>
            ) : (
              <span className="text-base text-gray-400">—</span>
            )}
          </div>
          {/* Instagram */}
          <div className="flex items-center mt-1">
            <FontAwesomeIcon icon={faInstagram} className="mr-1 text-pink-600" />
            {contact.instagramUsername ? (
              <a
                href={`https://instagram.com/${contact.instagramUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-base text-pink-600 hover:underline flex items-center"
              >
                @{contact.instagramUsername}
                <FontAwesomeIcon
                  icon={faExternalLinkAlt}
                  className="ml-1 text-xs"
                />
              </a>
            ) : (
              <span className="text-base text-gray-400">—</span>
            )}
          </div>
          {/* Future social networks can be added here */}
        </div>
      </Section>
      <Divider soft className="my-4" />
      <Section icon={faCopy} title="Notes">
        <p className="text-base text-gray-900 dark:text-gray-300">
          {contact.notes || "—"}
        </p>
      </Section>
      <Divider soft className="my-4" />
      <Section icon={faBook} title="Source">
        <Link
          href={`/dashboard/addressbooks?id=${contact.addressBook.id}`}
          className="text-base text-blue-600 underline cursor-pointer hover:text-blue-800 dark:text-blue-400 flex items-center"
        >
          {contact.addressBook.name || "Unknown"}
        </Link>
      </Section>
      {/* Last Updated row below cards */}
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
    </div>
  );
}

function getBadgeColor(type: string): BadgeProps["color"] {
  switch (type.toLowerCase()) {
    case "home":
      return "green";
    case "work":
      return "blue";
    case "mobile":
      return "orange";
    default:
      return "teal";
  }
}

function renderGroupedBadge(types: string[]) {
  if (types.length === 0) return null;
  const uniqueTypes = Array.from(new Set(types));
  return (
    <div className="flex flex-wrap gap-1">
      {uniqueTypes.map((type) => (
        <Badge
          key={type}
          color={getBadgeColor(type)}
          className="rounded-full px-2 py-0.5 text-xs font-semibold"
        >
          {type.toLowerCase()}
        </Badge>
      ))}
    </div>
  );
}

function iconsForValue(types: string[]) {
  if (types.includes("home")) {
    return <FontAwesomeIcon fixedWidth icon={faHome} className="mr-1" />;
  }
  if (types.includes("work")) {
    return <FontAwesomeIcon fixedWidth icon={faBuilding} className="mr-1" />;
  }
  if (
    types.includes("mobile") ||
    types.includes("cell") ||
    types.includes("cellphone") ||
    types.includes("voice")
  ) {
    return <FontAwesomeIcon fixedWidth icon={faMobile} className="mr-1" />;
  }

  return null;
}

function Address({ address }: { address: VCardProperty }) {
  const [pobox, extendedAddress, street, city, region, postalCode, country] =
    address.value.split(";");
  const fullAddress =
    `${street || ""}, ${city || ""}, ${region || ""}, ${postalCode || ""}, ${country || ""}`
      .replace(/(, )+/g, ", ")
      .replace(/^, |, $/g, "")
      .trim();

  const types = address.params["TYPE"] || [];
  const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(fullAddress)}&zoom=16&size=200x200&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&markers=color:red%7C${encodeURIComponent(fullAddress)}`;
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
  return (
    <div className="min-h-[128px] flex justify-between w-full">
      <div className="relative flex-grow flex flex-col justify-between">
        <div className="absolute top-0 right-0 p-0">
          <CopyButton value={fullAddress} label="address" />
        </div>
        <div className="">
          {types.includes("pref") && (
            <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-1">
              Preferred Address
            </p>
          )}
          <div className="flex-1 text-sm text-gray-900 dark:text-gray-300">
            {pobox && <div>{pobox}</div>}
            {(extendedAddress || street) && (
              <div>
                {extendedAddress && <span>{extendedAddress} </span>}
                <br />
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
          </div>
        </div>
        {types.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1 bottom-0">
            {renderGroupedBadge(types)}
          </div>
        )}
      </div>

      {fullAddress && (
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block mt-2 md:mt-0 md:ml-4"
        >
          <Image
            src={mapUrl}
            alt="Map preview of address"
            width={128}
            height={128}
            className="w-32 h-32 rounded-md object-cover shadow border border-gray-200 dark:border-gray-700 hover:scale-105 transition-transform"
          />
          <span className="sr-only">Open in Google Maps</span>
        </a>
      )}
    </div>
  );
}

function Email({ email }: { email: VCardProperty }) {
  const types = email.params["TYPE"] || [];
  return (
    <div className="relative flex flex-col md:justify-between w-full gap-2">
      <div className="absolute top-0 right-0 p-0">
        <CopyButton value={email.value} label="email" />
      </div>

      {types.includes("pref") && (
        <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-1">
          Preferred Email
        </p>
      )}
      <div className="ml-2 flex items-center gap-1 text-sm text-gray-900 dark:text-gray-200">
        {iconsForValue(types)}
        {email.value}
      </div>
      <div className="flex flex-wrap gap-1 mt-1">
        {renderGroupedBadge(types)}
      </div>
    </div>
  );
}

function Phone({ phone }: { phone: VCardProperty }) {
  const types = phone.params["TYPE"] || [];
  const formattedNumber = formatPhoneNumber(phone.value);
  const countryCode = getCountryFromPhoneNumber(phone.value);
  const flag = countryCode ? getCountryFlag(countryCode) : '';
  
  return (
    <div className="relative flex flex-col md:justify-between w-full gap-2">
      <div className="absolute top-0 right-0 p-0">
        <CopyButton value={phone.value} label="phone" />
      </div>
      {types.includes("pref") && (
        <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-1">
          Preferred Phone
        </p>
      )}
      <div className="ml-2 flex items-center text-sm text-gray-900 dark:text-gray-200 gap-2">
        {iconsForValue(types)}
        <span className="font-medium">{formattedNumber}</span>
        {flag && <span className="ml-1 text-base align-middle">{flag}</span>}
      </div>
      <div className="flex flex-wrap gap-1 mt-1">
        {renderGroupedBadge(types)}
      </div>
    </div>
  );
}
