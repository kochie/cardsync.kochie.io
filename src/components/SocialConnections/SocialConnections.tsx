import { Connection } from "@/actions/types";
import { getUser } from "@/actions/getUser";
import { getAdminDB } from "@/lib/firebaseAdmin";
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

export default async function SocialConnections() {
  const db = getAdminDB();
  const user = await getUser();

  if (!user) {
    return <div className="p-4">Please log in to view your connections.</div>;
  }

  const connectionsSnapshot = await db
    .collection(`users/${user.uid}/connections`)
    .get();

  const connections = connectionsSnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      lastSynced: data.lastSynced?.toDate ? data.lastSynced.toDate() : null,
      provider: data.provider || "Unknown",
      name: data.name || "Unnamed Connection",
      status: data.status || "Unknown",
      authMethod: data.authMethod || "Unknown",
      contacts: data.contacts || 0,
      syncFrequency: data.syncFrequency || "Manual",
    } as Connection;
  });

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
