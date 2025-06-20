"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import Link from "next/link";
import { Loader2, RefreshCw } from "lucide-react";
import { linkedinSyncAction } from "@/actions/linkedinSync";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {fab, faLinkedin} from "@fortawesome/free-brands-svg-icons"
import { LinkedinConnection } from "@/models/linkedinContact";

const dtFormat = new Intl.DateTimeFormat("en-AU");

library.add(fab)

export function ConnectionCard({ connection }: { connection: LinkedinConnection }) {
  const [pending, setPending] = useState(false);

  return (
    <Card key={connection.id}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <FontAwesomeIcon
              icon={faLinkedin}
              className="h-5 w-5 mr-2"
            />
            {connection.name}
          </CardTitle>
          <Badge>{connection.status}</Badge>
        </div>
        {connection.lastSynced && (
          <CardDescription>
            Last synced: {dtFormat.format(connection.lastSynced)}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-sm">
          {connection.numberContacts && <p>{connection.numberContacts} contacts</p>}
          {connection.cookies && (
            <p className="text-muted-foreground mt-1">
              Session Cookies
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          outline
          type="submit"
          disabled={pending}
          onClick={async () => {
            setPending(true);
            const result = await linkedinSyncAction(connection.id);
            if (result.error) {
              console.error("Error syncing:", result.error);
            }
            setPending(false);
          }}
        >
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync Now
            </>
          )}
        </Button>
        {connection.status === "Connected" && (
          <Link
            href={`/dashboard/connections/${connection.name.toLowerCase()}`}
          >
            <Button>
              Settings
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}
