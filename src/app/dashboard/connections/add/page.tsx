"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, ChevronRight, Facebook, Instagram, Linkedin, MessageCircle, Slack, Users } from "lucide-react"

export default function AddConnectionPage() {
  const [cookieValue, setCookieValue] = useState("")

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
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Add New Connection</h1>
        </div>

        <Tabs defaultValue="platforms">
          <TabsList className="mb-4">
            <TabsTrigger value="platforms">Popular Platforms</TabsTrigger>
            <TabsTrigger value="cookie">Cookie Authentication</TabsTrigger>
            <TabsTrigger value="api">API Authentication</TabsTrigger>
          </TabsList>

          <TabsContent value="platforms">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Link href="/dashboard/connections/add/linkedin">
                <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Linkedin className="h-5 w-5 text-blue-600" />
                      LinkedIn
                    </CardTitle>
                    <CardDescription>Connect with your professional network</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Import contacts from your LinkedIn connections. Requires session cookie authentication.
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard/connections/add/facebook">
                <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Facebook className="h-5 w-5 text-blue-600" />
                      Facebook
                    </CardTitle>
                    <CardDescription>Connect with your social network</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Import contacts from your Facebook friends. Uses API authentication.
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard/connections/add/instagram">
                <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Instagram className="h-5 w-5 text-pink-600" />
                      Instagram
                    </CardTitle>
                    <CardDescription>Connect with your followers</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Import contacts from your Instagram followers. Requires session cookie authentication.
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard/connections/add/slack">
                <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Slack className="h-5 w-5 text-purple-600" />
                      Slack
                    </CardTitle>
                    <CardDescription>Connect with your workspace</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Import contacts from your Slack workspaces. Uses OAuth authentication.
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard/connections/add/discord">
                <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5 text-indigo-600" />
                      Discord
                    </CardTitle>
                    <CardDescription>Connect with your servers</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Import contacts from your Discord servers. Uses OAuth authentication.
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </TabsContent>

          <TabsContent value="cookie">
            <Card>
              <CardHeader>
                <CardTitle>Session Cookie Authentication</CardTitle>
                <CardDescription>
                  For platforms without official APIs, you can provide a session cookie to sync contacts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="platform">Platform</Label>
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
                  <Label htmlFor="cookie">Session Cookie</Label>
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
                    <li>Open developer tools (F12 or right-click and select "Inspect")</li>
                    <li>Go to the "Application" or "Storage" tab</li>
                    <li>Find "Cookies" in the sidebar and select the website</li>
                    <li>Look for a cookie named something like "session" or "auth"</li>
                    <li>Copy the value and paste it above</li>
                  </ol>
                </div>
              </CardContent>
              <CardFooter>
                <Button disabled={!cookieValue.trim()}>Connect Platform</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="api">
            <Card>
              <CardHeader>
                <CardTitle>API Authentication</CardTitle>
                <CardDescription>Connect to a platform using API keys or OAuth credentials</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="api-platform">Platform</Label>
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
                  <Label htmlFor="api-key">API Key / Client ID</Label>
                  <Input id="api-key" placeholder="Enter your API key or client ID" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="api-secret">API Secret / Client Secret</Label>
                  <Input id="api-secret" type="password" placeholder="Enter your API secret or client secret" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="redirect-uri">Redirect URI (for OAuth)</Label>
                  <Input id="redirect-uri" value="https://contactsync.app/oauth/callback" readOnly />
                  <p className="text-sm text-muted-foreground">
                    Use this URL as the redirect URI when setting up your OAuth application.
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button>Connect Platform</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
