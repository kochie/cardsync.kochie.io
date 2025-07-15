import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloud, faSync, faExclamationTriangle, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { faLinkedin, faInstagram } from "@fortawesome/free-brands-svg-icons";
import { createClient } from "@/utils/supabase/server";
import { Metadata } from "next";

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
  const supabase = await createClient();
  // Fetch all connections
  const [{ data: linkedin }, { data: instagram }, { data: carddav }] = await Promise.all([
    supabase.from("linkedin_connections").select("*"),
    supabase.from("instagram_connections").select("*"),
    supabase.from("carddav_connections").select("*"),
  ]);
  // Fetch total contacts
  const { count: totalContacts } = await supabase.from("carddav_contacts").select("id", { count: "exact", head: true });
  // TODO: Replace with real duplicate count logic
  const duplicateCount = 5;

  // Merge all accounts
  const accounts = [
    ...(linkedin || []).map((a) => ({
      id: a.id,
      provider: "linkedin",
      name: a.name,
      status: a.status,
      lastSynced: a.last_synced,
      contactCount: a.number_contacts,
    })),
    ...(instagram || []).map((a) => ({
      id: a.id,
      provider: "instagram",
      name: a.name,
      status: a.status,
      lastSynced: a.last_synced,
      contactCount: a.follower_count,
      username: a.username,
    })),
    ...(carddav || []).map((a) => ({
      id: a.id,
      provider: "carddav",
      name: a.name,
      status: a.status,
      lastSynced: a.last_synced,
      contactCount: a.contact_count,
      username: a.username,
    })),
  ];

  return (
    <main className="flex-1 container py-6 mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
          <div className="text-3xl font-bold">{totalContacts ?? 0}</div>
          <div className="text-gray-500 mt-1">Total Contacts</div>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
          <div className="text-3xl font-bold">{accounts.length}</div>
          <div className="text-gray-500 mt-1">Connected Accounts</div>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
          <div className="text-3xl font-bold">{duplicateCount}</div>
          <div className="text-gray-500 mt-1">Duplicates</div>
          <Link href="/dashboard/duplicates">
            <Button className="mt-2 text-sm px-3 py-1 h-8">Review Duplicates</Button>
          </Link>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Account Sync Status</h2>
        {accounts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No accounts connected yet.</p>
            <Link href="/dashboard/connections/add">
              <Button>Add Account</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600 border-b">
                  <th className="py-2 px-2">Provider</th>
                  <th className="py-2 px-2">Account</th>
                  <th className="py-2 px-2">Status</th>
                  <th className="py-2 px-2">Contacts</th>
                  <th className="py-2 px-2">Last Sync</th>
                  <th className="py-2 px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((acc) => (
                  <tr key={acc.provider + acc.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-2">{providerIcon(acc.provider)}</td>
                    <td className="py-2 px-2 font-medium">{acc.name}</td>
                    <td className="py-2 px-2">{statusBadge(acc.status)}</td>
                    <td className="py-2 px-2">{acc.contactCount ?? 0}</td>
                    <td className="py-2 px-2">{acc.lastSynced ? new Date(acc.lastSynced).toLocaleString() : "Never"}</td>
                    <td className="py-2 px-2">
                      <form action="/api/connection-sync" method="POST">
                        <input type="hidden" name="connectionId" value={acc.id} />
                        <input type="hidden" name="provider" value={acc.provider} />
                        <Button type="submit" className="text-sm px-3 py-1 h-8">Sync Now</Button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
