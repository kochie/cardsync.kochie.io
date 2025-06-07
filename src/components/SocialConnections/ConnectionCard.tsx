"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp, library } from "@fortawesome/fontawesome-svg-core";
import { Connection } from "@/actions/types";
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

import {fab} from "@fortawesome/free-brands-svg-icons"

const dtFormat = new Intl.DateTimeFormat("en-AU");

library.add(fab)

const getIcon = (provider: string): IconProp => {
  switch (provider) {
    case "linkedin":
      return ["fab", "linkedin"];
    case "facebook":
      return ["fab", "facebook"];
    case "instagram":
      return ["fab", "instagram"];
    default:
      return ["fas", "question-circle"];
  }
};

export function ConnectionCard({ connection }: { connection: Connection }) {
  const [pending, setPending] = useState(false);

  return (
    <Card key={connection.id}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <FontAwesomeIcon
              icon={getIcon(connection.provider)}
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
          {connection.contacts && <p>{connection.contacts} contacts</p>}
          {connection.authMethod && (
            <p className="text-muted-foreground mt-1">
              {connection.authMethod}
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
