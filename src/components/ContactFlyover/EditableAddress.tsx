"use client";

import { useState } from "react";
import { VCardProperty } from "@/utils/vcard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faTrash } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";

interface EditableAddressProps {
  address: VCardProperty;
  onUpdate: (address: VCardProperty) => void;
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

export default function EditableAddress({ 
  address, 
  onUpdate, 
  onRemove 
}: EditableAddressProps) {
  const [pobox, extendedAddress, street, city, region, postalCode, country] =
    address.value.split(";");

  const [addingType, setAddingType] = useState(false);
  const [newType, setNewType] = useState("");

  const updateAddressValue = (index: number, value: string) => {
    const parts = address.value.split(";");
    parts[index] = value;
    const newAddress = new VCardProperty(
      address.key,
      address.params,
      parts.join(";"),
      address.group
    );
    onUpdate(newAddress);
  };

  const types = address.params["TYPE"] || [];
  const fullAddress = `${street || ""}, ${city || ""}, ${region || ""}, ${postalCode || ""}, ${country || ""}`
    .replace(/(, )+/g, ", ")
    .replace(/^, |, $/g, "")
    .trim();

  const removeType = (type: string) => {
    const newTypes = types.filter((t) => t !== type);
    const newParams = { ...address.params, TYPE: newTypes };
    if (newTypes.length === 0) delete (newParams as any).TYPE;
    onUpdate(new VCardProperty(address.key, newParams, address.value, address.group));
  };

  const addType = () => {
    const cleanType = newType.trim().toLowerCase();
    if (!cleanType || types.includes(cleanType)) return;
    const newTypes = [...types, cleanType];
    const newParams = { ...address.params, TYPE: newTypes };
    onUpdate(new VCardProperty(address.key, newParams, address.value, address.group));
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
    <div className="min-h-[128px] flex justify-between w-full">
      <div className="relative flex-grow flex flex-col justify-between">
        <div className="absolute top-0 right-0 p-0 flex gap-2">
          <CopyButton value={fullAddress} label="address" />
          <button
            onClick={onRemove}
            className="text-red-500 hover:text-red-700"
            title="Remove address"
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
        <div className="space-y-2">
          <input
            type="text"
            value={pobox || ""}
            onChange={(e) => updateAddressValue(0, e.target.value)}
            placeholder="P.O. Box"
            className="text-sm text-gray-900 dark:text-gray-300 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none w-full"
          />
          <input
            type="text"
            value={extendedAddress || ""}
            onChange={(e) => updateAddressValue(1, e.target.value)}
            placeholder="Extended Address"
            className="text-sm text-gray-900 dark:text-gray-300 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none w-full"
          />
          <input
            type="text"
            value={street || ""}
            onChange={(e) => updateAddressValue(2, e.target.value)}
            placeholder="Street"
            className="text-sm text-gray-900 dark:text-gray-300 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none w-full"
          />
          <div className="flex gap-2">
            <input
              type="text"
              value={city || ""}
              onChange={(e) => updateAddressValue(3, e.target.value)}
              placeholder="City"
              className="text-sm text-gray-900 dark:text-gray-300 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none flex-1"
            />
            <input
              type="text"
              value={region || ""}
              onChange={(e) => updateAddressValue(4, e.target.value)}
              placeholder="State/Region"
              className="text-sm text-gray-900 dark:text-gray-300 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none flex-1"
            />
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={postalCode || ""}
              onChange={(e) => updateAddressValue(5, e.target.value)}
              placeholder="Postal Code"
              className="text-sm text-gray-900 dark:text-gray-300 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none flex-1"
            />
            <input
              type="text"
              value={country || ""}
              onChange={(e) => updateAddressValue(6, e.target.value)}
              placeholder="Country"
              className="text-sm text-gray-900 dark:text-gray-300 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none flex-1"
            />
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-1 items-center">
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
    </div>
  );
} 