import { Metadata } from "next";

export const metadata: Metadata = {
  title: "CardDAV",
};

export default function CardDavLayout({
  children, // This is the page content that will be rendered inside the layout
}: {
  children: React.ReactNode;
}) {
  return children 
}
