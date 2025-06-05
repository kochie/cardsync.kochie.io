"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <Users className="h-5 w-5" />
            <span>ContactSync</span>
          </Link>
          <div className="ml-4 flex items-center gap-1 text-sm text-muted-foreground">
            <Link href="/dashboard" className="hover:text-foreground">
              Dashboard
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span>CardDAV Accounts</span>
          </div>
        </div>
      </header>
      <main className="flex-1 container py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">CardDAV Accounts</h1>
          </div>
          <Button onClick={() => router.push("/dashboard/carddav/add")}>
            <Plus className="mr-2 h-4 w-4" />
            Add Account
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Manage CardDAV Accounts</CardTitle>
            <CardDescription>
              CardDAV accounts allow you to sync contacts with your devices and services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className={`flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg ${
                    account.status === "Error" ? "border-red-200 bg-red-50" : ""
                  }`}
                >
                  <div className="space-y-1 mb-4 md:mb-0">
                    <div className="font-medium flex items-center">
                      {account.useSSL ? (
                        <Shield className="h-4 w-4 text-green-600 mr-2" />
                      ) : (
                        <Server className="h-4 w-4 text-amber-600 mr-2" />
                      )}
                      {account.name}
                    </div>
                    <div className="text-sm text-muted-foreground">{account.server}</div>
                    <div className="text-sm text-muted-foreground">{account.username}</div>
                  </div>
                  <div className="text-sm md:text-right space-y-1 mb-4 md:mb-0">
                    <div>{account.contactCount} contacts</div>
                    <div>Last sync: {account.lastSync}</div>
                    <Badge variant={account.status === "Error" ? "destructive" : "default"}>{account.status}</Badge>
                  </div>
                  <div className="flex gap-2 self-end md:self-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSync(account.id)}
                      disabled={syncingAccount === account.id}
                    >
                      {syncingAccount === account.id ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                          Syncing...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Sync
                        </>
                      )}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/carddav/edit/${account.id}`)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}

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
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
