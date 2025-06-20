"use client";

import SidebarProvider from "@/components/Sidebar";
import { UserProvider } from "../context/userContext";

export default function DashboardLayout({
  children, // This is the page content that will be rendered inside the layout
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <SidebarProvider>{children}</SidebarProvider>
    </UserProvider>
  );
}
