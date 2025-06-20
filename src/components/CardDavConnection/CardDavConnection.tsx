"use client";

import { useActionState, useEffect, useState } from "react";
import { onSnapshot, getFirestore, collection } from "firebase/firestore";
import { app } from "@/firebase";
import { Badge, RefreshCw, Settings, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { useAuth } from "@/context/AuthProvider";
import { deleteCardDavAction } from "@/actions/deleteCardDav";
import { cardDavSyncPull, cardDavSyncPush } from "@/actions/cardDavSync";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faRefresh, faUpload } from "@fortawesome/free-solid-svg-icons";
import { CardDav } from "@/models/carddav";

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
  const [accounts, setAccounts] = useState<CardDav[]>([]);
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
        setAccounts(data as CardDav[]);
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
              <div>Last sync: {account.lastSynced?.toISOString()}</div>
              <Badge>{account.status}</Badge>
            </div>
            <div className="ml-4 flex gap-2">
              <SyncButtons id={account.id} />
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

function SyncButtons({ id }: { id: string }) {
  const [pending, setPending] = useState(false);

  async function onPull() {
    setPending(true);
    try {
      await cardDavSyncPull(id)
    } finally {
      setPending(false);
    }
  }

  async function onPush() {
    setPending(true);
    try {
      await cardDavSyncPush(id)
    } finally {
      setPending(false);
    }
  }


  return (
    <>
      <Button
        outline
        type="submit"
        disabled={pending}
        onClick={onPull}
        className="cursor-pointer"
      >
        {pending ? (
          <>
            <FontAwesomeIcon icon={faRefresh} spin className="h-4 w-4" /> 
            <span className="sr-only">Syncing...</span>
          </>
        ) : (
          <>
            <FontAwesomeIcon icon={faDownload} className="h-4 w-4" />
            <span className="sr-only">Sync</span>
          </>
        )}
      </Button>
            <Button
        outline
        type="submit"
        disabled={pending}
        onClick={onPush}
        className="cursor-pointer"
      >
        {pending ? (
          <>
            <FontAwesomeIcon icon={faRefresh} spin className="h-4 w-4" /> 
            <span className="sr-only">Syncing...</span>
          </>
        ) : (
          <>
            <FontAwesomeIcon icon={faUpload} className="h-4 w-4" />
            <span className="sr-only">Sync</span>
          </>
        )}
      </Button>
</>  );
  
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
