"use client";

import { useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp, library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { fas } from "@fortawesome/free-solid-svg-icons"; // For default icon
import { Connection } from "@/actions/types";
import { linkedinSyncAction } from "@/actions/linkedinSync";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, Settings } from "lucide-react";

library.add(fab, fas);

const dtFormat = new Intl.DateTimeFormat("en-AU", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const getIcon = (provider: string): IconProp => {
  switch (provider.toLowerCase()) {
    case "linkedin":
      return ["fab", "linkedin"];
    case "facebook":
      return ["fab", "facebook"];
    case "instagram":
      return ["fab", "instagram"];
    case "discord":
      return ["fab", "discord"];
    // Add other providers as needed
    default:
      return ["fas", "question-circle"]; // A default icon
  }
};

export function ConnectionTableRow({ connection }: { connection: Connection }) {
  const [pending, setPending] = useState(false);

  const handleSync = async () => {
    setPending(true);
    // Here, you might want a more generic sync action dispatcher
    // based on connection.provider if you have multiple sync actions.
    if (connection.provider.toLowerCase() === "linkedin") {
      const result = await linkedinSyncAction(connection.id);
      if (result.error) {
        console.error("Error syncing LinkedIn:", result.error);
        // Optionally, show a toast notification for the error
      } else {
        // Optionally, show a success toast
        console.log("LinkedIn sync successful");
      }
    } else {
      console.warn(`Sync action not implemented for provider: ${connection.provider}`);
    }
    setPending(false);
  };

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-2">
          <FontAwesomeIcon
            icon={getIcon(connection.provider)}
            className="h-5 w-5"
          />
          {connection.provider.charAt(0).toUpperCase() + connection.provider.slice(1)}
        </div>
      </TableCell>
      <TableCell className="font-medium">{connection.name}</TableCell>
      <TableCell>
        {connection.lastSynced ? dtFormat.format(new Date(connection.lastSynced)) : "Never"}
      </TableCell>
      <TableCell>{connection.syncFrequency || "Manual"}</TableCell>
      <TableCell>{connection.contacts ?? 0}</TableCell>
      <TableCell>
        <Badge variant={connection.status === "Connected" ? "default" : "outline"}>
          {connection.status}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={pending}
          >
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-1.5" />
                Sync Now
              </>
            )}
          </Button>
          {connection.status === "Connected" && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/connections/${connection.id}/settings`}> {/* Assuming settings page uses ID */}
                <Settings className="h-4 w-4 mr-1.5" />
                Settings
              </Link>
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
