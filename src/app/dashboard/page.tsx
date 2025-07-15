import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";
import TotalContactsCount from "./TotalContactsCount";
import { Metadata } from "next";
import AccountConnectionsSummary from "./AccountConnectionsSummary";

export const metadata: Metadata = {
  title: "Dashboard",
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
