import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloud, faSync, faExclamationTriangle, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { faLinkedin, faInstagram } from "@fortawesome/free-brands-svg-icons";
import { Suspense } from "react";
import TotalContactsCount from "./TotalContactsCount";
import { Metadata } from "next";
import AccountConnectionsSummary from "./AccountConnectionsSummary";

export const metadata: Metadata = {
  title: "Dashboard",
}

function providerIcon(provider: string) {
  switch (provider) {
    case "linkedin": return <FontAwesomeIcon icon={faLinkedin} className="text-blue-600" />;
    case "instagram": return <FontAwesomeIcon icon={faInstagram} className="text-pink-500" />;
    case "carddav": return <FontAwesomeIcon icon={faCloud} className="text-purple-600" />;
    default: return <FontAwesomeIcon icon={faExclamationTriangle} className="text-gray-400" />;
  }
}

function statusBadge(status: string) {
  switch (status) {
    case "connected": return <Badge color="green"><FontAwesomeIcon icon={faCheckCircle} className="mr-1" />Connected</Badge>;
    case "syncing": return <Badge color="blue"><FontAwesomeIcon icon={faSync} spin className="mr-1" />Syncing</Badge>;
    case "error": return <Badge color="red"><FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" />Error</Badge>;
    default: return <Badge color="zinc">Unknown</Badge>;
  }
}

export default async function Dashboard() {
  // TODO: Replace with real duplicate count logic
  const duplicateCount = 5;

  return (
    <main className="flex-1 container py-6 mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
          <div className="text-3xl font-bold">
            <Suspense fallback={"..."}>
              <TotalContactsCount />
            </Suspense>
          </div>
          <div className="text-gray-500 mt-1">Total Contacts</div>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
          <div className="text-3xl font-bold">{duplicateCount}</div>
          <div className="text-gray-500 mt-1">Duplicates</div>
          <Link href="/dashboard/duplicates">
            <Button className="mt-2 text-sm px-3 py-1 h-8">Review Duplicates</Button>
          </Link>
        </div>
        <Suspense fallback={<div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">...</div>}>
          <AccountConnectionsSummary />
        </Suspense>
      </div>
    </main>
  );
}
