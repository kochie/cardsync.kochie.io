"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, ChevronRight, Facebook, Instagram, Linkedin, MessageCircle, Slack, Users } from "lucide-react"

export default function AddConnectionPage() {

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
            <Link href="/dashboard/connections" className="hover:text-foreground">
              Connections
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span>Add</span>
          </div>
        </div>
      </header>
      <main className="flex-1 container py-6">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/dashboard/connections">
            <Button>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Add New Connection</h1>
        </div>

        {/* Tabs replaced with custom tab logic */}
        <TabsContentDiv />
      </main>
    </div>
  )
}

// Custom tab logic and content
function TabsContentDiv() {
  const [tab, setTab] = useState<"platforms" | "cookie" | "api">("platforms")
  const [cookieValue, setCookieValue] = useState("")

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <button
          className={`px-4 py-2 rounded-t ${tab === "platforms" ? "bg-white border-b-2 border-primary font-semibold" : "bg-gray-100"}`}
          onClick={() => setTab("platforms")}
        >
          Popular Platforms
        </button>
        <button
          className={`px-4 py-2 rounded-t ${tab === "cookie" ? "bg-white border-b-2 border-primary font-semibold" : "bg-gray-100"}`}
          onClick={() => setTab("cookie")}
        >
          Cookie Authentication
        </button>
        <button
          className={`px-4 py-2 rounded-t ${tab === "api" ? "bg-white border-b-2 border-primary font-semibold" : "bg-gray-100"}`}
          onClick={() => setTab("api")}
        >
          API Authentication
        </button>
      </div>

      {tab === "platforms" && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/dashboard/connections/add/linkedin">
            <div className="border rounded-xl p-4 hover:border-primary/50 transition-colors cursor-pointer bg-white">
              <div className="mb-2 flex items-center gap-2 text-lg font-semibold">
                <Linkedin className="h-5 w-5 text-blue-600" />
                LinkedIn
              </div>
              <div className="text-gray-500 mb-2">Connect with your professional network</div>
              <div className="text-sm text-muted-foreground">
                Import contacts from your LinkedIn connections. Requires session cookie authentication.
              </div>
            </div>
          </Link>
          <Link href="/dashboard/connections/add/facebook">
            <div className="border rounded-xl p-4 hover:border-primary/50 transition-colors cursor-pointer bg-white">
              <div className="mb-2 flex items-center gap-2 text-lg font-semibold">
                <Facebook className="h-5 w-5 text-blue-600" />
                Facebook
              </div>
              <div className="text-gray-500 mb-2">Connect with your social network</div>
              <div className="text-sm text-muted-foreground">
                Import contacts from your Facebook friends. Uses API authentication.
              </div>
            </div>
          </Link>
          <Link href="/dashboard/connections/add/instagram">
            <div className="border rounded-xl p-4 hover:border-primary/50 transition-colors cursor-pointer bg-white">
              <div className="mb-2 flex items-center gap-2 text-lg font-semibold">
                <Instagram className="h-5 w-5 text-pink-600" />
                Instagram
              </div>
              <div className="text-gray-500 mb-2">Connect with your followers</div>
              <div className="text-sm text-muted-foreground">
                Import contacts from your Instagram followers. Requires session cookie authentication.
              </div>
            </div>
          </Link>
          <Link href="/dashboard/connections/add/slack">
            <div className="border rounded-xl p-4 hover:border-primary/50 transition-colors cursor-pointer bg-white">
              <div className="mb-2 flex items-center gap-2 text-lg font-semibold">
                <Slack className="h-5 w-5 text-purple-600" />
                Slack
              </div>
              <div className="text-gray-500 mb-2">Connect with your workspace</div>
              <div className="text-sm text-muted-foreground">
                Import contacts from your Slack workspaces. Uses OAuth authentication.
              </div>
            </div>
          </Link>
          <Link href="/dashboard/connections/add/discord">
            <div className="border rounded-xl p-4 hover:border-primary/50 transition-colors cursor-pointer bg-white">
              <div className="mb-2 flex items-center gap-2 text-lg font-semibold">
                <MessageCircle className="h-5 w-5 text-indigo-600" />
                Discord
              </div>
              <div className="text-gray-500 mb-2">Connect with your servers</div>
              <div className="text-sm text-muted-foreground">
                Import contacts from your Discord servers. Uses OAuth authentication.
              </div>
            </div>
          </Link>
        </div>
      )}

      {tab === "cookie" && (
        <div className="border rounded-xl bg-white p-6 max-w-xl mx-auto">
          <div className="mb-4">
            <div className="text-lg font-semibold mb-1">Session Cookie Authentication</div>
            <div className="text-gray-500">
              For platforms without official APIs, you can provide a session cookie to sync contacts
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="platform" className="font-medium">Platform</label>
              <select
                id="platform"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="linkedin">LinkedIn</option>
                <option value="instagram">Instagram</option>
                <option value="twitter">Twitter</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="cookie" className="font-medium">Session Cookie</label>
              <Textarea
                id="cookie"
                placeholder="Paste your session cookie here"
                className="min-h-[100px]"
                value={cookieValue}
                onChange={(e) => setCookieValue(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                This cookie will be stored securely and only used to sync your contacts.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium">How to get your session cookie:</h3>
              <ol className="text-sm text-muted-foreground space-y-2 list-decimal pl-4">
                <li>Log in to the platform in your browser</li>
                <li>Open developer tools (F12 or right-click and select &quot;Inspect&quot;)</li>
                <li>Go to the &quot;Application&quot; or &quot;Storage&quot; tab</li>
                <li>Find &quot;Cookies&quot; in the sidebar and select the website</li>
                <li>Look for a cookie named something like &quot;session&quot; or &quot;auth&quot;</li>
                <li>Copy the value and paste it above</li>
              </ol>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button disabled={!cookieValue.trim()}>Connect Platform</Button>
          </div>
        </div>
      )}

      {tab === "api" && (
        <div className="border rounded-xl bg-white p-6 max-w-xl mx-auto">
          <div className="mb-4">
            <div className="text-lg font-semibold mb-1">API Authentication</div>
            <div className="text-gray-500">
              Connect to a platform using API keys or OAuth credentials
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="api-platform" className="font-medium">Platform</label>
              <select
                id="api-platform"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="facebook">Facebook</option>
                <option value="slack">Slack</option>
                <option value="discord">Discord</option>
                <option value="google">Google Contacts</option>
                <option value="microsoft">Microsoft 365</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="api-key" className="font-medium">API Key / Client ID</label>
              <Input id="api-key" placeholder="Enter your API key or client ID" />
            </div>
            <div className="space-y-2">
              <label htmlFor="api-secret" className="font-medium">API Secret / Client Secret</label>
              <Input id="api-secret" type="password" placeholder="Enter your API secret or client secret" />
            </div>
            <div className="space-y-2">
              <label htmlFor="redirect-uri" className="font-medium">Redirect URI (for OAuth)</label>
              <Input id="redirect-uri" value="https://contactsync.app/oauth/callback" readOnly />
              <p className="text-sm text-muted-foreground">
                Use this URL as the redirect URI when setting up your OAuth application.
              </p>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button>Connect Platform</Button>
          </div>
        </div>
      )}
    </div>
  )
}
