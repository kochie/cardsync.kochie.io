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
import { LinkedinConnection } from "@/models/linkedinContact";
import { Tables } from "@/types/database.types";

export default function SocialConnections() {
  const supabase = createClient();

  const [connections, setConnections] = useState<LinkedinConnection[]>([]);

  const fetchConnections = useCallback(async () => {
    const { data, error } = await supabase
      .from("linkedin_connections")
      .select("*");

    if (error) {
      console.error("Error fetching connections:", error);
      return;
    }

    const formattedConnections = data.map((connection) =>
      LinkedinConnection.fromDatabaseObject(connection)
    );


    setConnections(formattedConnections);
  }, [supabase]);

  const listenForConnectionChanges = useCallback(() => {
    const channels = supabase
      .channel("custom-all-channel")
      .on<Tables<"linkedin_connections">>(
        "postgres_changes",
        { event: "*", schema: "public", table: "linkedin_connections" },
        (payload) => {
          if (payload.eventType === "DELETE") {
            setConnections((prev) =>
              prev.filter((account) => account.id !== payload.old.id)
            );
          } else if (payload.eventType === "INSERT") {
            setConnections((prev) => [
              ...prev,
              LinkedinConnection.fromDatabaseObject(payload.new),
            ]);
          } else if (payload.eventType === "UPDATE") {
            setConnections((prev) =>
              prev.map((account) =>
                account.id === payload.new?.id
                  ? LinkedinConnection.fromDatabaseObject(payload.new)
                  : account
              )
            );
          }
          console.log("Change received!", payload);
        }
      )
      .subscribe();

    return channels
  }, [supabase]);

  useEffect(() => {
    fetchConnections();
    const channels = listenForConnectionChanges();

    return () => {
      // Cleanup the subscription when the component unmounts
      channels.unsubscribe();
    }
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
                  key={connection.id}
                  connection={connection}
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
