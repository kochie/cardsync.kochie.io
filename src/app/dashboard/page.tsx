import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  ArrowRight,
  Facebook,
  Linkedin,
  LogOut,
  Settings,
  Slack,
  Users,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CardDavConnection from "@/components/CardDavConnection/CardDavConnection";
import { logoutAction } from "@/actions/logout";
import SocialConnections from "@/components/SocialConnections/SocialConnections";
import { getUser } from "@/actions/getUser";

export default async function Dashboard() {
  const user = await getUser();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center mx-auto">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-semibold"
          >
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
            <Button
              variant="ghost"
              size="icon"
              type="submit"
              className="cursor-pointer"
              formAction={logoutAction}
            >
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
            <Badge
              variant="outline"
              className="text-yellow-500 border-yellow-200 bg-yellow-50"
            >
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
            <TabsTrigger className="cursor-pointer" value="carddav">
              CardDAV
            </TabsTrigger>
            <TabsTrigger className="cursor-pointer" value="connections">
              Connections
            </TabsTrigger>
            <TabsTrigger className="cursor-pointer" value="contacts">
              Contacts
            </TabsTrigger>
            <TabsTrigger className="cursor-pointer" value="sync">
              Sync History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="carddav">
            <CardDavConnection />
          </TabsContent>

          <TabsContent value="connections">
            <SocialConnections />
          </TabsContent>

          <TabsContent value="contacts">
            <Card>
              <CardHeader>
                <CardTitle>Contact Statistics</CardTitle>
                <CardDescription>
                  Overview of your contact database
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">
                        Total Contacts
                      </span>
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
                <CardDescription>
                  Recent synchronization activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center gap-2">
                      <Linkedin className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">LinkedIn</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      2 hours ago
                    </div>
                    <div className="text-sm">
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200"
                      >
                        +3 contacts
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center gap-2">
                      <Slack className="h-4 w-4 text-purple-600" />
                      <span className="font-medium">Slack</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      3 hours ago
                    </div>
                    <div className="text-sm">
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200"
                      >
                        +1 contact
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center gap-2">
                      <Facebook className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">Facebook</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      1 day ago
                    </div>
                    <div className="text-sm">
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700 border-blue-200"
                      >
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
  );
}
