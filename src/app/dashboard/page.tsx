"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  AlertCircle,
  ArrowRight,
  Facebook,
  Instagram,
  Linkedin,
  Loader2,
  LogOut,
  MessageCircle,
  RefreshCw,
  Settings,
  Slack,
  Users,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/context/AuthContext"

export default function Dashboard() {
  const [syncingPlatform, setSyncingPlatform] = useState<string | null>(null)

  const startSync = (platform: string) => {
    setSyncingPlatform(platform)
    // In a real app, this would trigger the sync process
    setTimeout(() => setSyncingPlatform(null), 2000)
  }

  const {user} = useAuth()

  console.log(user)

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center mx-auto">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <Users className="h-5 w-5" />
            <span>ContactSync</span>
          </Link>
          <nav className="ml-auto flex items-center gap-4">
            <Link href="/dashboard/settings">
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder-user.jpg" alt="User" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{user?.displayName}</span>
            </div>
            <Button variant="ghost" size="icon">
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Log out</span>
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex-1 container py-6 mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-yellow-500 border-yellow-200 bg-yellow-50">
              <AlertCircle className="h-3 w-3 mr-1" />5 duplicates need review
            </Badge>
            <Link href="/dashboard/duplicates">
              <Button size="sm">
                Resolve Duplicates
                <ArrowRight className="ml-2 h-3 w-3" />
              </Button>
            </Link>
          </div>
        </div>

        <Tabs defaultValue="connections">
          <TabsList className="mb-4">
            <TabsTrigger value="connections">Connections</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="sync">Sync History</TabsTrigger>
          </TabsList>

          <TabsContent value="connections">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center">
                      <Linkedin className="h-5 w-5 mr-2 text-blue-600" />
                      LinkedIn
                    </CardTitle>
                    <Badge>Connected</Badge>
                  </div>
                  <CardDescription>Last synced: 2 hours ago</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    <p>356 contacts</p>
                    <p className="text-muted-foreground mt-1">Using session cookie authentication</p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm" onClick={() => startSync("LinkedIn")}>
                    {syncingPlatform === "LinkedIn" ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Sync Now
                      </>
                    )}
                  </Button>
                  <Link href="/dashboard/connections/linkedin">
                    <Button variant="ghost" size="sm">
                      Settings
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center">
                      <Facebook className="h-5 w-5 mr-2 text-blue-600" />
                      Facebook
                    </CardTitle>
                    <Badge>Connected</Badge>
                  </div>
                  <CardDescription>Last synced: 1 day ago</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    <p>218 contacts</p>
                    <p className="text-muted-foreground mt-1">Using API authentication</p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm" onClick={() => startSync("Facebook")}>
                    {syncingPlatform === "Facebook" ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Sync Now
                      </>
                    )}
                  </Button>
                  <Link href="/dashboard/connections/facebook">
                    <Button variant="ghost" size="sm">
                      Settings
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center">
                      <Instagram className="h-5 w-5 mr-2 text-pink-600" />
                      Instagram
                    </CardTitle>
                    <Badge variant="outline">Not Connected</Badge>
                  </div>
                  <CardDescription>Connect to sync contacts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    <p className="text-muted-foreground">Connect using session cookie authentication</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href="/dashboard/connections/add/instagram">
                    <Button size="sm">
                      Connect
                      <ArrowRight className="ml-2 h-3 w-3" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center">
                      <Slack className="h-5 w-5 mr-2 text-purple-600" />
                      Slack
                    </CardTitle>
                    <Badge>Connected</Badge>
                  </div>
                  <CardDescription>Last synced: 3 hours ago</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    <p>124 contacts</p>
                    <p className="text-muted-foreground mt-1">Using OAuth authentication</p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm" onClick={() => startSync("Slack")}>
                    {syncingPlatform === "Slack" ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Sync Now
                      </>
                    )}
                  </Button>
                  <Link href="/dashboard/connections/slack">
                    <Button variant="ghost" size="sm">
                      Settings
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center">
                      <MessageCircle className="h-5 w-5 mr-2 text-indigo-600" />
                      Discord
                    </CardTitle>
                    <Badge variant="outline">Not Connected</Badge>
                  </div>
                  <CardDescription>Connect to sync contacts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    <p className="text-muted-foreground">Connect using OAuth authentication</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href="/dashboard/connections/add/discord">
                    <Button size="sm">
                      Connect
                      <ArrowRight className="ml-2 h-3 w-3" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              <Card className="border-dashed">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Add New Connection</CardTitle>
                  <CardDescription>Connect another platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    <p className="text-muted-foreground">Choose from available platforms or add a custom source</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href="/dashboard/connections/add">
                    <Button variant="outline" size="sm">
                      Add Connection
                      <ArrowRight className="ml-2 h-3 w-3" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="contacts">
            <Card>
              <CardHeader>
                <CardTitle>Contact Statistics</CardTitle>
                <CardDescription>Overview of your contact database</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Total Contacts</span>
                      <span className="text-sm">698</span>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">With Email</span>
                      <span className="text-sm">632 (90%)</span>
                    </div>
                    <Progress value={90} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">With Phone</span>
                      <span className="text-sm">584 (84%)</span>
                    </div>
                    <Progress value={84} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">With Photo</span>
                      <span className="text-sm">421 (60%)</span>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/dashboard/contacts">
                  <Button>
                    View All Contacts
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="sync">
            <Card>
              <CardHeader>
                <CardTitle>Sync History</CardTitle>
                <CardDescription>Recent synchronization activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center gap-2">
                      <Linkedin className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">LinkedIn</span>
                    </div>
                    <div className="text-sm text-muted-foreground">2 hours ago</div>
                    <div className="text-sm">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        +3 contacts
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center gap-2">
                      <Slack className="h-4 w-4 text-purple-600" />
                      <span className="font-medium">Slack</span>
                    </div>
                    <div className="text-sm text-muted-foreground">3 hours ago</div>
                    <div className="text-sm">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        +1 contact
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center gap-2">
                      <Facebook className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">Facebook</span>
                    </div>
                    <div className="text-sm text-muted-foreground">1 day ago</div>
                    <div className="text-sm">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        Updated 5 contacts
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/dashboard/sync-history">
                  <Button variant="outline">View Full History</Button>
                </Link>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
