import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Contacts",
}

export default function DashboardLayout({
  children, // This is the page content that will be rendered inside the layout
}: {
  children: React.ReactNode;
}) {
  return <Suspense>{children}</Suspense>;
}
