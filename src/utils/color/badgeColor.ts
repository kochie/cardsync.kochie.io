import { BadgeProps } from "@/components/ui/badge";

export function getEmailTypeColor(type: string): BadgeProps["color"] {
  switch (type.toLowerCase()) {
    case "home":
      return "blue";
    case "work":
      return "green";
    case "internet":
      return "purple";
    case "pref":
      return "orange";
    case "cell":
      return "lime";
    case "voice":
      return "yellow";
    case "x-mobile":
    case "mobile":
      return "pink";
    default:
      return "zinc"; // fallback for unknown types
  }
}