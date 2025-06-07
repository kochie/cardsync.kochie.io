"use client";

import { useActionState, useEffect, useState } from "react";
import { onSnapshot, getFirestore, collection } from "firebase/firestore";
import { app } from "@/firebase";
import { Badge, Plus, RefreshCw, Settings, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";
import { deleteCardDavAction } from "@/actions/deleteCardDav";
import { cardDavSyncAction } from "@/actions/cardDavSync";

interface CardDavConnection {
  id: string;
  name: string;
  server: string;
  username: string;
  password: string;
  contactCount: number;
  lastSync: string;
  status: string;
}

export default function CardDavConnection() {
  return (
    <div className="grid gap-6">
      <div className="space-y-4">
        {/* CardDAV accounts list will be rendered here */}
        <CardDAVAccountsList />
      </div>
    </div>
  );
}

function CardDAVAccountsList() {
  const [accounts, setAccounts] = useState<CardDavConnection[]>([]);
  const db = getFirestore(app);

  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      return;
    }

    return onSnapshot(
      collection(db, "users", user.uid, "carddav"),
      (snapshot) => {
        // console.log("Snapshot data:", snapshot.data());
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAccounts(data as CardDavConnection[]);
      }
    );
  }, [db, user]);

  return (
    <div className="space-y-4">
      {accounts.length > 0 ? (
        accounts.map((account) => (
          <div
            key={account.id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div className="space-y-1">
              <div className="font-medium">{account.name}</div>
              <div className="text-sm text-muted-foreground">
                {account.server}
              </div>
              <div className="text-sm text-muted-foreground">
                {account.username}
              </div>
            </div>
            <div className="text-sm text-right space-y-1">
              <div>{account.contactCount} contacts</div>
              <div>Last sync: {account.lastSync}</div>
              <Badge>{account.status}</Badge>
            </div>
            <div className="ml-4 flex gap-2">
              <SyncButton id={account.id} />
              <Button outline className="cursor-pointer">
                <Settings className="h-4 w-4" />
                <span className="sr-only">Settings</span>
              </Button>
              <DeleteButton id={account.id} />
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-8 border rounded-lg border-dashed">
          <div className="text-muted-foreground mb-2">
            No CardDAV accounts configured
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Add a CardDAV account to sync contacts with your devices and
            services
          </p>
        </div>
      )}
    </div>
  );
}

function SyncButton({ id }: { id: string }) {
  const [, action, pending] = useActionState(
    cardDavSyncAction.bind(null, {}, id),
    null
  );

  return (
    <form action={action}>
      <Button
        outline
        type="submit"
        disabled={pending}
        className="cursor-pointer"
      >
        {pending ? (
          <>
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="sr-only">Syncing...</span>
          </>
        ) : (
          <>
            <RefreshCw className="h-4 w-4" />
            <span className="sr-only">Sync</span>
          </>
        )}
      </Button>
    </form>
  );
}

function DeleteButton({ id }: { id: string }) {
  const [, action, pending] = useActionState(
    deleteCardDavAction.bind(null, id),
    null
  );

  return (
    <form action={action}>
      <Button type="submit" disabled={pending} className="cursor-pointer">
        {pending ? (
          <>
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="sr-only">Deleting...</span>
          </>
        ) : (
          <>
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </>
        )}
      </Button>
    </form>
  );
}
