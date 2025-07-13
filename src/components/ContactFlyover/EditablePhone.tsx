"use client";

import { useState } from "react";
import { VCardProperty } from "@/utils/vcard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faTrash, faHome, faBuilding, faMobile } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import { formatPhoneNumber, getCountryFlag, getCountryFromPhoneNumber } from "@/utils/phone/format";

interface EditablePhoneProps {
  phone: VCardProperty;
  onUpdate: (phone: VCardProperty) => void;
  onRemove: () => void;
}

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

export default function EditablePhone({ 
  phone, 
  onUpdate, 
  onRemove 
}: EditablePhoneProps) {
  const types = phone.params["TYPE"] || [];
  const [addingType, setAddingType] = useState(false);
  const [newType, setNewType] = useState("");
  const formattedNumber = formatPhoneNumber(phone.value);
  const countryCode = getCountryFromPhoneNumber(phone.value);
  const flag = countryCode ? getCountryFlag(countryCode) : '';

  const removeType = (type: string) => {
    const newTypes = types.filter((t) => t !== type);
    const newParams = { ...phone.params, TYPE: newTypes };
    if (newTypes.length === 0) delete (newParams as any).TYPE;
    onUpdate(new VCardProperty(phone.key, newParams, phone.value, phone.group));
  };

  const addType = () => {
    const cleanType = newType.trim().toLowerCase();
    if (!cleanType || types.includes(cleanType)) return;
    const newTypes = [...types, cleanType];
    const newParams = { ...phone.params, TYPE: newTypes };
    onUpdate(new VCardProperty(phone.key, newParams, phone.value, phone.group));
    setNewType("");
  };

  const handleTypeInputBlur = () => {
    const cleanType = newType.trim().toLowerCase();
    if (cleanType && !types.includes(cleanType)) {
      addType();
    }
    setAddingType(false);
    setNewType("");
  };

  return (
    <div className="relative flex flex-col md:justify-between w-full gap-2">
      <div className="absolute top-0 right-0 p-0 flex gap-2">
        <CopyButton value={phone.value} label="phone" />
        <button
          onClick={onRemove}
          className="text-red-500 hover:text-red-700"
          title="Remove phone"
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>
      </div>
      <div className="ml-2 flex items-center gap-2">
        {iconsForValue(types)}
        <input
          type="tel"
          value={phone.value}
          onChange={(e) => {
            const newPhone = new VCardProperty(
              phone.key,
              phone.params,
              e.target.value,
              phone.group
            );
            onUpdate(newPhone);
          }}
          placeholder="+1 (555) 123-4567"
          className="text-sm text-gray-900 dark:text-gray-200 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none flex-1 font-medium"
        />
        {flag && <span className="ml-1 text-base align-middle">{flag}</span>}
        {formattedNumber !== phone.value && (
          <span className="ml-2 text-xs text-gray-500">
            ({formattedNumber})
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-1 mt-1 items-center">
        {types.map((type) => (
          <span key={type} className="flex items-center bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-semibold">
            {type}
            <button
              type="button"
              className="ml-1 text-gray-400 hover:text-red-500 focus:outline-none"
              onClick={() => removeType(type)}
              tabIndex={-1}
              aria-label={`Remove label ${type}`}
            >
              ×
            </button>
          </span>
        ))}
        {addingType ? (
          <input
            type="text"
            value={newType}
            onChange={e => setNewType(e.target.value)}
            onBlur={handleTypeInputBlur}
            onKeyDown={e => { if (e.key === "Enter") { addType(); setAddingType(false); setNewType(""); } else if (e.key === "Escape") { setAddingType(false); setNewType(""); }}}
            className="ml-1 px-1 py-0.5 text-xs border-b border-gray-300 focus:border-blue-500 outline-none rounded"
            autoFocus
            placeholder="Add label"
            maxLength={20}
          />
        ) : (
          <button
            type="button"
            className="ml-1 text-blue-500 hover:text-blue-700 text-xs font-bold px-1"
            onClick={() => setAddingType(true)}
            aria-label="Add label"
          >
            +
          </button>
        )}
      </div>
    </div>
  );
} 