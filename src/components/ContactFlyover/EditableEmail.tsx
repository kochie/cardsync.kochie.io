"use client";

import { useState } from "react";
import { VCardProperty } from "@/utils/vcard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faTrash, faHome, faBuilding, faMobile } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";

interface EditableEmailProps {
  email: VCardProperty;
  onUpdate: (email: VCardProperty) => void;
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

export default function EditableEmail({ 
  email, 
  onUpdate, 
  onRemove 
}: EditableEmailProps) {
  const types = email.params["TYPE"] || [];
  const [addingType, setAddingType] = useState(false);
  const [newType, setNewType] = useState("");

  const removeType = (type: string) => {
    const newTypes = types.filter((t) => t !== type);
    const newParams = { ...email.params, TYPE: newTypes };
    if (newTypes.length === 0) delete (newParams as any).TYPE;
    onUpdate(new VCardProperty(email.key, newParams, email.value, email.group));
  };

  const addType = () => {
    const cleanType = newType.trim().toLowerCase();
    if (!cleanType || types.includes(cleanType)) return;
    const newTypes = [...types, cleanType];
    const newParams = { ...email.params, TYPE: newTypes };
    onUpdate(new VCardProperty(email.key, newParams, email.value, email.group));
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
        <CopyButton value={email.value} label="email" />
        <button
          onClick={onRemove}
          className="text-red-500 hover:text-red-700"
          title="Remove email"
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>
      </div>
      <div className="ml-2 flex items-center gap-1">
        {iconsForValue(types)}
        <input
          type="email"
          value={email.value}
          onChange={(e) => {
            const newEmail = new VCardProperty(
              email.key,
              email.params,
              e.target.value,
              email.group
            );
            onUpdate(newEmail);
          }}
          placeholder="email@example.com"
          className="text-sm text-gray-900 dark:text-gray-200 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none flex-1"
        />
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