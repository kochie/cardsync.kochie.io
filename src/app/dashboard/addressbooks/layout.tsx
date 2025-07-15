import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Address Books",
}

export default function AddressBooksLayout({
  children, // This is the page content that will be rendered inside the layout
}: {
  children: React.ReactNode;
}) {
  return (
      children
  );
}