import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connections",
}

export default function ConnectionsLayout({
  children, // This is the page content that will be rendered inside the layout
}: {
  children: React.ReactNode;
}) {
  return (
    children
  );
}