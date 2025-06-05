import { Connection } from "@/actions/types";

import { ConnectionCard } from "./ConnectionCard";
import { getUser } from "@/actions/getUser";
import { getAdminDB } from "@/lib/firebaseAdmin";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function SocialConnections() {
  const db = getAdminDB();
  const user = await getUser();

  if (!user) {
    return <div>Please log in to view your connections.</div>;
  }
  console.log("User ID:", `users/${user.uid}/connections`);

  const connections = await db
    .collection(`users/${user.uid}/connections`)
    .get()
    .then((snapshot) =>
      snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Connection)
      )
    );

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>CardDAV Accounts</CardTitle>
          <CardDescription>
            Manage your CardDAV server connections for contact synchronization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {connections.length > 0 ? (
                connections.map((connector) => (
                  <ConnectionCard key={connector.id} connection={connector} />
                ))
              ) : (
                <div className="text-center py-8 border rounded-lg border-dashed">
                  <div className="text-muted-foreground mb-2">
                    No Connections accounts configured
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add a Connections account to sync contacts with your devices
                    and services
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Link
            href={"/dashboard/linkedin/add"}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add CardDAV Account
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
