"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp, library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { fas } from "@fortawesome/free-solid-svg-icons"; // For default icon
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge, BadgeProps } from "@/components/ui/badge";
import { ConnectionStatus } from "@/models/linkedinContact";
import { Dropdown, DropdownButton, DropdownMenu, DropdownItem } from "@/components/ui/dropdown";
import { matchInstagramByName } from "@/actions/connections/instagram";
import { matchLinkedinByName } from "@/actions/connections/linkedin";

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

// Use SocialConnection type from SocialConnections.tsx (plain object)
export function ConnectionTableRow({
  connection,
  onDelete,
}: {
  connection: {
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
  onDelete?: (id: string, provider: string) => void;
}) {
  const [, setPending] = useState(false);

  const handleSync = async () => {
    setPending(true);
    fetch("/api/connection-sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        connectionId: connection.id,
        provider: connection.provider,
      }),
    });
    setPending(false);
  };

  const handleMatch = async () => {
    setPending(true);
    if (connection.provider === "instagram") {
      await matchInstagramByName(connection.id)
    } else if (connection.provider === "linkedin") {
      await matchLinkedinByName(connection.id)
    }
    setPending(false);
  };

  const handleEdit = () => {
    window.location.href = `/dashboard/connections/edit/${connection.provider}/${connection.id}`;
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this connection?") && onDelete) {
      onDelete(connection.id, connection.provider);
    }
  };

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={getIcon(connection.provider)} className="h-5 w-5" />
          {connection.provider.charAt(0).toUpperCase() + connection.provider.slice(1)}
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
        <Dropdown>
          <DropdownButton as={Button} outline>Actions</DropdownButton>
          <DropdownMenu anchor="bottom end">
            <DropdownItem onClick={handleSync}>Sync</DropdownItem>
            <DropdownItem onClick={handleEdit}>Edit</DropdownItem>
            <DropdownItem onClick={handleMatch}>Match</DropdownItem>
            <DropdownItem onClick={handleDelete}>Delete</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </TableCell>
    </TableRow>
  );
}
