"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dropdown,
  DropdownButton,
  DropdownItem,
  DropdownMenu,

} from "@/components/ui/dropdown"
import {
  ArrowLeft,
  ChevronRight,
  Edit,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Server,
  Shield,
  Trash2,
  Users,
} from "lucide-react"
import { useRouter } from "next/navigation"
import CardDavConnection from "@/components/CardDavConnection/CardDavConnection"
import { Heading } from "@/components/ui/heading"

export default function CardDAVPage() {
  const router = useRouter()
  const [syncingAccount, setSyncingAccount] = useState<number | null>(null)

  const accounts = [
    {
      id: 1,
      name: "iCloud Contacts",
      server: "contacts.icloud.com",
      username: "user@icloud.com",
      lastSync: "2 hours ago",
      status: "Connected",
      contactCount: 342,
      useSSL: true,
    },
    {
      id: 2,
      name: "Google Contacts",
      server: "google.com",
      username: "user@gmail.com",
      lastSync: "1 day ago",
      status: "Connected",
      contactCount: 567,
      useSSL: true,
    },
    {
      id: 3,
      name: "Nextcloud Contacts",
      server: "nextcloud.example.com",
      username: "username",
      lastSync: "3 days ago",
      status: "Error",
      contactCount: 128,
      useSSL: true,
    },
  ]

  const handleSync = (id: number) => {
    setSyncingAccount(id)
    // Simulate sync
    setTimeout(() => {
      setSyncingAccount(null)
    }, 2000)
  }

  return (
    <div className="flex flex-col">
      <main className="flex-1 container py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Heading className="text-2xl font-bold">CardDAV Servers</Heading>
          </div>
          <Button onClick={() => router.push("/dashboard/carddav/add")} className="cursor-pointer flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            Add Account
          </Button>
        </div>

        <div>
          <div>
            <div>Manage CardDAV Accounts</div>
            <div>
              CardDAV accounts allow you to sync contacts with your devices and services
            </div>
          </div>
          <div>
            <div className="space-y-4">
              <CardDavConnection /> 

              {accounts.length === 0 && (
                <div className="text-center py-8 border rounded-lg border-dashed">
                  <div className="text-muted-foreground mb-2">No CardDAV accounts configured</div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add a CardDAV account to sync contacts with your devices and services
                  </p>
                  <Button onClick={() => router.push("/dashboard/carddav/add")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add CardDAV Account
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
