"use client";

import { useActionState, useCallback, useEffect, useState } from "react";
import { RefreshCw, Settings, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { deleteCardDavAction } from "@/actions/deleteCardDav";
import { cardDavSyncPull, cardDavSyncPush } from "@/actions/cardDavSync";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDownload,
  faRefresh,
  faUpload,
} from "@fortawesome/free-solid-svg-icons";
import { CardDav, CardDavStatus } from "@/models/carddav";
import { createClient } from "@/utils/supabase/client";
import { useUser } from "@/app/context/userContext";
import { Badge, BadgeProps } from "../ui/badge";
import { Tables } from "@/types/database.types";

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

function Status({ status }: { status: string }) {
  const statusMap: Record<string, { label: string; color: BadgeProps["color"] }> = {
    [CardDavStatus.Connected]: { label: "Connected", color: "green" },
    [CardDavStatus.Disconnected]: { label: "Disconnected", color: "amber" },
    [CardDavStatus.Syncing]: { label: "Syncing", color: "yellow" },
    [CardDavStatus.Error]: { label: "Error", color: "red" },
  };

  const currentStatus = statusMap[status] || {
    label: "Unknown",
    color: "fuchsia",
  };

  return (
    <Badge color={currentStatus.color} className={`px-2 py-1 text-xs`}>
      {currentStatus.label}
    </Badge>
  );
}

function CardDAVAccountsList() {
  const [accounts, setAccounts] = useState<CardDav[]>([]);
  const supabase = createClient();
  const { user } = useUser();

  const getAccounts = useCallback(async () => {
    if (!user) {
      return;
    }

    const { data, error } = await supabase
      .from("carddav_connections")
      .select("*");

    if (error) {
      console.error("Error fetching CardDAV accounts:", error.message);
      return;
    }

    setAccounts(data.map((account) => CardDav.fromDatabaseObject(account)));
  }, [supabase, user]);

  useEffect(() => {
    const channels = supabase
      .channel("custom-all-channel")
      .on<Tables<"carddav_connections">>(
        "postgres_changes",
        { event: "*", schema: "public", table: "carddav_connections" },
        (payload) => {
          if (payload.eventType === "DELETE") {
            setAccounts((prev) =>
              prev.filter((account) => account.id !== payload.old.id)
            );
          } else if (payload.eventType === "INSERT") {
            setAccounts((prev) => [
              ...prev,
              CardDav.fromDatabaseObject(payload.new),
            ]);
          } else if (payload.eventType === "UPDATE") {
            setAccounts((prev) =>
              prev.map((account) =>
                account.id === payload.new?.id
                  ? CardDav.fromDatabaseObject(payload.new)
                  : account
              )
            );
          }
          console.log("Change received!", payload);
        }
      )
      .subscribe();

    getAccounts();

    return () => {
      channels.unsubscribe();
    };
  }, [getAccounts, supabase]);

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
              <div>Last sync: {account.lastSynced?.toLocaleString()}</div>
              <Status status={account.status} />
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
      await cardDavSyncPull(id);
    } finally {
      setPending(false);
    }
  }

  async function onPush() {
    setPending(true);
    try {
      await cardDavSyncPush(id);
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
    </>
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
