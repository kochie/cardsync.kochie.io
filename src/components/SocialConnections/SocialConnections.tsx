"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ConnectionTableRow } from "./ConnectionTableRow";
import { createClient } from "@/utils/supabase/client";
import { useCallback, useEffect, useState } from "react";
import { LinkedinConnection, ConnectionStatus } from "@/models/linkedinContact";
import { Tables } from "@/types/database.types";
import toast from "react-hot-toast";

type SocialConnection = {
  id: string;
  cookies: string;
  name: string;
  sessionId: string;
  numberContacts: number;
  lastSynced?: Date;
  status: ConnectionStatus;
  syncFrequency: string;
  username: string;
  provider: "linkedin" | "instagram";
};

// Minimal InstagramConnection class for table display
function instagramToPlainObject(
  data: Tables<"instagram_connections">,
): SocialConnection {
  return {
    id: data.id,
    cookies: data.cookies,
    name: data.name,
    sessionId: data.session_id,
    numberContacts: data.follower_count || 0,
    lastSynced: data.last_synced ? new Date(data.last_synced) : undefined,
    status: (data.status as ConnectionStatus) || ConnectionStatus.Connected,
    syncFrequency: data.sync_frequency || "manual",
    username: data.username || "",
    provider: "instagram",
  };
}

function linkedinToPlainObject(conn: LinkedinConnection): SocialConnection {
  return {
    id: conn.id,
    cookies: conn.cookies,
    name: conn.name,
    sessionId: conn.sessionId,
    numberContacts: conn.numberContacts,
    lastSynced: conn.lastSynced,
    status: conn.status,
    syncFrequency: conn.syncFrequency,
    username: "",
    provider: "linkedin",
  };
}

export default function SocialConnections() {
  const supabase = createClient();

  const [connections, setConnections] = useState<SocialConnection[]>([]);

  const fetchConnections = useCallback(async () => {
    const [
      { data: linkedinData, error: linkedinError },
      { data: instagramData, error: instagramError },
    ] = await Promise.all([
      supabase.from("linkedin_connections").select("*"),
      supabase.from("instagram_connections").select("*"),
    ]);

    if (linkedinError || instagramError) {
      console.error(
        "Error fetching connections:",
        linkedinError,
        instagramError,
      );
      return;
    }

    const linkedinConnections: SocialConnection[] = (linkedinData || []).map(
      (connection) =>
        linkedinToPlainObject(
          LinkedinConnection.fromDatabaseObject(connection),
        ),
    );
    const instagramConnections: SocialConnection[] = (instagramData || []).map(
      (connection) => instagramToPlainObject(connection),
    );

    setConnections([...linkedinConnections, ...instagramConnections]);
  }, [supabase]);

  const listenForConnectionChanges = useCallback(() => {
    const channel = supabase.channel("social-connections-channel");

    // LinkedIn
    channel.on<Tables<"linkedin_connections">>(
      "postgres_changes",
      { event: "*", schema: "public", table: "linkedin_connections" },
      (payload) => {
        setConnections((prev) => {
          if (payload.eventType === "DELETE") {
            return prev.filter((account) => account.id !== payload.old.id);
          } else if (payload.eventType === "INSERT") {
            return [
              ...prev,
              linkedinToPlainObject(
                LinkedinConnection.fromDatabaseObject(payload.new),
              ),
            ];
          } else if (payload.eventType === "UPDATE") {
            return prev.map((account) =>
              account.id === payload.new?.id && account.provider === "linkedin"
                ? linkedinToPlainObject(
                    LinkedinConnection.fromDatabaseObject(payload.new),
                  )
                : account,
            );
          }
          return prev;
        });
        console.log("LinkedIn change received!", payload);
      },
    );

    // Instagram
    channel.on<Tables<"instagram_connections">>(
      "postgres_changes",
      { event: "*", schema: "public", table: "instagram_connections" },
      (payload) => {
        setConnections((prev) => {
          if (payload.eventType === "DELETE") {
            return prev.filter((account) => account.id !== payload.old.id);
          } else if (payload.eventType === "INSERT") {
            return [...prev, instagramToPlainObject(payload.new)];
          } else if (payload.eventType === "UPDATE") {
            return prev.map((account) =>
              account.id === payload.new?.id && account.provider === "instagram"
                ? instagramToPlainObject(payload.new)
                : account,
            );
          }
          return prev;
        });
        console.log("Instagram change received!", payload);
      },
    );

    channel.subscribe();
    return channel;
  }, [supabase]);

  const handleDelete = async (id: string, provider: string) => {
    console.log(`Deleting ${provider} connection with ID: ${id}`);

    if (provider === "linkedin") {
      const { error } = await supabase
        .from("linkedin_connections")
        .delete()
        .eq("id", id);
      if (error) {
        console.error("Error deleting LinkedIn connection:", error);
        toast.error("Failed to delete LinkedIn connection", {
          id: `delete-linkedin-${id}`,
        });
      }
    } else if (provider === "instagram") {
      const { error } = await supabase
        .from("instagram_connections")
        .delete()
        .eq("id", id);
      if (error) {
        console.error("Error deleting Instagram connection:", error);
        toast.error("Failed to delete Instagram connection", {
          id: `delete-instagram-${id}`,
        });
      }
    }
    // UI will update automatically due to realtime subscription
  };

  useEffect(() => {
    fetchConnections();
    const channels = listenForConnectionChanges();

    return () => {
      // Cleanup the subscription when the component unmounts
      channels.unsubscribe();
    };
  }, [fetchConnections, listenForConnectionChanges]);

  return (
    <div className="space-y-6">
      {connections.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Provider</TableHeader>
                <TableHeader>Name</TableHeader>
                <TableHeader>Last Synced</TableHeader>
                <TableHeader>Sync Frequency</TableHeader>
                <TableHeader>Contacts</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader className="text-right">Actions</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {connections.map((connection) => (
                <ConnectionTableRow
                  key={connection.id + connection.provider}
                  connection={connection}
                  onDelete={handleDelete}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg border-dashed">
          <h3 className="text-xl font-medium text-muted-foreground mb-2">
            No connections yet
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Add a social connection to start syncing your contacts.
          </p>
          <Button>
            <Link href={"/dashboard/connections/add"}>
              <Plus className="mr-2 h-4 w-4" />
              Add First Connection
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
