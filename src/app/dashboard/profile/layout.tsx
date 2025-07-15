import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile",
};

export default function ProfileLayout({
  children, // This is the page content that will be rendered inside the layout
}: {
  children: React.ReactNode;
}) {
  return children
}
