import { Suspense } from "react";

export default function DashboardLayout({
  children, // This is the page content that will be rendered inside the layout
}: {
  children: React.ReactNode;
}) {
  return <Suspense>{children}</Suspense>;
}
