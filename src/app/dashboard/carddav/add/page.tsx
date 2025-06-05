"use client";

import type React from "react";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  ChevronRight,
  Loader2,
  Server,
  Shield,
  Users,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { createCardDavAction } from "@/actions/createCardDav";

const presets = [
  { name: "iCloud", server: "contacts.icloud.com", path: "/", ssl: true },
  { name: "Google", server: "google.com", path: "/", ssl: true },
  {
    name: "Nextcloud",
    server:
      "your-nextcloud-server.com/remote.php/dav/addressbooks/users/username/contacts",
    path: "/",
    ssl: true,
  },
  { name: "Fastmail", server: "carddav.fastmail.com", path: "/", ssl: true },
  {
    name: "Synology",
    server: "your-synology-server.com/caldav/addressbooks/username/default",
    path: "/",
    ssl: true,
  },
];

export default function AddCardDAVPage() {
  const router = useRouter();

  const [useSSL, setUseSSL] = useState(true);

  const [,formAction, pending] = useActionState(
    createCardDavAction,
    {
        errors: {}
    }
  );

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
          <div className="ml-4 flex items-center gap-1 text-sm text-muted-foreground">
            <Link href="/dashboard" className="hover:text-foreground">
              Dashboard
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/dashboard" className="hover:text-foreground">
              CardDAV
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span>Add Account</span>
          </div>
        </div>
      </header>
      <main className="flex-1 container py-6 mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Add CardDAV Account</h1>
        </div>

        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="manual">Manual Setup</TabsTrigger>
            <TabsTrigger value="presets">Common Presets</TabsTrigger>
          </TabsList>

          <TabsContent value="manual">
            <Card>
              <form action={formAction}>
                <CardHeader>
                  <CardTitle>CardDAV Account Details</CardTitle>
                  <CardDescription>
                    Enter your CardDAV server details to sync contacts with your
                    devices and services
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Account Name</Label>
                      <Input
                        name="name"
                        id="name"
                        placeholder="My CardDAV Account"
                        required
                      />
                      <p className="text-sm text-muted-foreground">
                        A friendly name to identify this account
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="server">Server URL</Label>
                      <div className="flex items-center">
                        <div className="flex items-center border rounded-l-md px-3 bg-muted">
                          {useSSL ? (
                            <>
                              <Shield className="h-4 w-4 text-green-600 mr-1" />
                              https://
                            </>
                          ) : (
                            <>
                              <Server className="h-4 w-4 text-amber-600 mr-1" />
                              http://
                            </>
                          )}
                        </div>
                        <Input
                          name="server"
                          id="server"
                          placeholder="carddav.example.com"
                          className="rounded-l-none"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        name="username"
                        id="username"
                        placeholder="username or email"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        name="password"
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        required
                      />
                      <p className="text-sm text-muted-foreground">
                        Your password is encrypted and stored securely
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="syncFrequency">Sync Frequency</Label>
                      <Select name="syncFrequency">
                        <SelectTrigger id="syncFrequency">
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manual">Manual only</SelectItem>
                          <SelectItem value="hourly">Hourly</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="useSSL" className="block mb-2">
                        Security
                      </Label>
                      <div className="flex items-center space-x-2">
                        <Switch
                          name="useSSL"
                          id="useSSL"
                          checked={useSSL}
                          onCheckedChange={setUseSSL}
                        />
                        <Label htmlFor="useSSL">
                          Use SSL/TLS (recommended)
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      name="description"
                      id="description"
                      placeholder="Additional notes about this account"
                      className="min-h-[80px]"
                    />
                  </div>

                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="advanced">
                      <AccordionTrigger>Advanced Settings</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-2">
                          <div className="space-y-2">
                            <Label htmlFor="addressBookPath">
                              Address Book Path
                            </Label>
                            <Input
                              name="addressBookPath"
                              id="addressBookPath"
                              placeholder="/addressbooks/username/default/"
                            />
                            <p className="text-sm text-muted-foreground">
                              Leave empty to use the server&apos;s default path
                            </p>
                          </div>

                          <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                              <Switch
                                name="syncAllContacts"
                                id="syncAllContacts"
                              />
                              <Label htmlFor="syncAllContacts">
                                Sync all contacts
                              </Label>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Switch name="syncGroups" id="syncGroups" />
                              <Label htmlFor="syncGroups">
                                Sync contact groups
                              </Label>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Switch name="syncPhotos" id="syncPhotos" />
                              <Label htmlFor="syncPhotos">
                                Sync contact photos
                              </Label>
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => router.push("/dashboard")}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={pending}>
                    {pending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      "Add Account"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="presets">
            <Card>
              <CardHeader>
                <CardTitle>Common CardDAV Providers</CardTitle>
                <CardDescription>
                  Select a preset for popular CardDAV providers to simplify
                  setup
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {presets.map((preset) => (
                    <Card
                      key={preset.name}
                      className="hover:border-primary/50 transition-colors cursor-pointer"
                      onClick={() => {
                        // setFormData((prev) => ({
                        //   ...prev,
                        //   name: `${preset.name} Contacts`,
                        //   server: preset.server,
                        //   addressBookPath: preset.path,
                        //   useSSL: preset.ssl,
                        // }))
                        document.getElementById("manual-tab")?.click();
                      }}
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{preset.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {preset.server}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-muted-foreground">
                  Select a preset to pre-fill the server details, then complete
                  your account information
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
