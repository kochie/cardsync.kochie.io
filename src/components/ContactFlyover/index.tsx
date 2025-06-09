import { Contact } from "@/models/contacts";
import { Dialog, DialogPanel } from "@headlessui/react";
import GoogleAvatar from "../GoogleAvatar";
import { useEffect, useState } from "react";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { app } from "@/firebase";
import { useAuth } from "@/context/AuthProvider";

type ContactFlyoverProps = {
  contact: Contact | null;
  open: boolean;
  onClose: () => void;
};

const db = getFirestore(app);

export default function ContactFlyover({
  contact,
  open,
  onClose,
}: ContactFlyoverProps) {
  const { user } = useAuth();
  const [sourceNames, setSourceNames] = useState<string[]>([]);

  useEffect(() => {
    if (!contact || !user) return;

    const fetchSources = async () => {
      const names: string[] = [];

      for (const src of contact.sources || []) {
        if (src.startsWith("carddav:")) {
          const id = src.split(":")[1];
          const ref = doc(db, `users/${user.uid}/carddav/${id}`);
          const snapshot = await getDoc(ref);
          if (snapshot.exists()) {
            names.push(snapshot.data().name || id);
          } else {
            names.push(id);
          }
        } else {
          names.push(src);
        }
      }

      setSourceNames(names);
    };

    fetchSources();
  }, [contact, user]);

  if (!contact) return null;

  return (
    <Dialog as="div" className="relative z-50" onClose={onClose} open={open}>
      <div className="fixed inset-0 flex justify-end">
        <DialogPanel
          className="my-2 w-screen max-w-lg bg-white shadow-xl p-6 overflow-y-auto duration-1000 ease-out data-closed:transform-[scale(95%)] data-closed:translate-x-full data-closed:opacity-0 data-open:transform-none data-open:translate-x-0 data-open:opacity-100 rounded-lg"
          transition
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">{contact.name}</h2>
            <button
              onClick={onClose}
              className="text-sm text-gray-500 hover:text-gray-800"
            >
              Close
            </button>
          </div>
          <div className="space-y-2">
            <GoogleAvatar path={contact.photoUrl} name={contact.name} />

            <p className="text-sm text-gray-700">
              <strong>Title:</strong> {contact.title || "—"}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Company:</strong> {contact.company || "—"}
            </p>
            <div>
              <p className="font-semibold text-sm">Emails:</p>
              <ul className="space-y-2">
                {contact.emails.map((e, i) => {
                  const [prefix, value] = e.split(":");
                  const typeMatch = prefix.match(/TYPE=([^;]*)/i);
                  const types = typeMatch ? typeMatch[1].split(",") : [];
                  return (
                    <li key={i}>
                      <div className="text-sm font-medium text-gray-800">{value}</div>
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
                {contact.phone.map((p, i) => {
                  const [prefix, value] = p.split(":");
                  const typeMatch = prefix.match(/TYPE=([^;]*)/i);
                  const types = typeMatch ? typeMatch[1].split(",") : [];
                  return (
                    <li key={i}>
                      <div className="text-sm font-medium text-gray-800">{value}</div>
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
              <strong>Source:</strong>{" "}
              {sourceNames.length > 0 ? sourceNames.join(", ") : "—"}
            </p>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
