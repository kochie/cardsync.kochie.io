"use client";

import { useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp, library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { fas } from "@fortawesome/free-solid-svg-icons"; // For default icon
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge, BadgeProps } from "@/components/ui/badge";
import { Loader2, RefreshCw, Settings } from "lucide-react";
import { ConnectionStatus, LinkedinConnection } from "@/models/linkedinContact";

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

const getStatusColor = (status: ConnectionStatus): BadgeProps["color"] => {
  switch (status) {
    case ConnectionStatus.Connected:
      return "green";
    case ConnectionStatus.Disconnected:
      return "amber";
    case ConnectionStatus.Syncing:
      return "yellow";
    case ConnectionStatus.Error:
      return "red";
    default:
      return "fuchsia"; // Default color for unknown status
  }
}

export function ConnectionTableRow({
  connection,
}: {
  connection: LinkedinConnection;
}) {
  const [pending, setPending] = useState(false);

  const handleSync = async () => {
    setPending(true);
    // Here, you might want a more generic sync action dispatcher
    // based on connection.provider if you have multiple sync actions.
    fetch("/api/connection-sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        connectionId: connection.id,
      }),
    });

    setPending(false);
  };

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={getIcon("linkedin")} className="h-5 w-5" />
          Linkedin
        </div>
      </TableCell>
      <TableCell className="font-medium">{connection.name}</TableCell>
      <TableCell>
        {connection.lastSynced
          ? dtFormat.format(new Date(connection.lastSynced))
          : "Never"}
      </TableCell>
      <TableCell>{connection.syncFrequency || "Manual"}</TableCell>
      <TableCell>{connection.numberContacts}</TableCell>
      <TableCell>
        <Badge color={getStatusColor(connection.status)}>{connection.status}</Badge>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <Button outline onClick={handleSync} disabled={pending}>
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
          {connection.status === ConnectionStatus.Connected && (
            <Button outline>
              <Link href={`/dashboard/connections/${connection.id}/settings`}>
                {" "}
                {/* Assuming settings page uses ID */}
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
