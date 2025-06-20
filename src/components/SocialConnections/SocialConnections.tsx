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
import { createClient } from "@/utils/supabase/server";
import camelcaseKeys from "camelcase-keys";

export default async function SocialConnections() {
  const supabase = await createClient();

  const {data, error} = await supabase.from("linkedin_connections").select("*")

  if (error) {
    console.error("Error fetching connections:", error);
    return <div className="p-4">Error loading connections.</div>;
  }

  const connections = camelcaseKeys(data, { deep: true }).map((conn) => ({
    ...conn,
    lastSynced: conn.lastSynced ? new Date(conn.lastSynced) : undefined,
    status: conn.status ?? "connected",
    syncFrequency: conn.syncFrequency ?? "manual",
  }));

  return (
    <div className="space-y-6">


      {data.length > 0 ? (
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
                <ConnectionTableRow key={connection.id} connection={connection} />
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
