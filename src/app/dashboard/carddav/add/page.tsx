"use client";

import type React from "react";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import { Field, Label } from "@/components/ui/fieldset";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  ChevronRight,
  Loader2,
  Server,
  Shield,
  Users,
} from "lucide-react";

import { createCardDavAction } from "@/actions/carddav/create";

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
  const [, formAction, pending] = useActionState(createCardDavAction, {
    errors: {},
  });

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
            <Button>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Add CardDAV Account</h1>
        </div>

        {/* Tabs replaced with custom tab logic */}
        <CardDavTabs
          formAction={formAction}
          pending={pending}
          presets={presets}
        />
      </main>
    </div>
  );
}

interface CardDavTabsProps {
  formAction: (payload: FormData) => void;
  pending: boolean;
  presets: Array<{
    name: string;
    server: string;
    path?: string;
    ssl?: boolean;
  }>;
}

// Custom tab logic and content
function CardDavTabs({ formAction, pending, presets }: CardDavTabsProps) {
  const [tab, setTab] = useState<"manual" | "presets">("manual");

  return (
    <div className="w-full">
      <div className="flex gap-2 mb-4">
        <button
          className={`px-4 py-2 rounded-t ${
            tab === "manual"
              ? "bg-white border-b-2 border-primary font-semibold"
              : "bg-gray-100"
          }`}
          onClick={() => setTab("manual")}
          id="manual-tab"
        >
          Manual Setup
        </button>
        <button
          className={`px-4 py-2 rounded-t ${
            tab === "presets"
              ? "bg-white border-b-2 border-primary font-semibold"
              : "bg-gray-100"
          }`}
          onClick={() => setTab("presets")}
        >
          Common Presets
        </button>
      </div>

      {tab === "manual" && (
        <div className="bg-white border rounded-xl shadow">
          <form action={formAction}>
            {/* CardHeader */}
            <div className="p-6 border-b">
              <div className="text-xl font-semibold mb-1">
                CardDAV Account Details
              </div>
              <div className="text-gray-500">
                Enter your CardDAV server details to sync contacts with your
                devices and services
              </div>
            </div>
            {/* CardContent */}
            <div className="p-6 space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Field>
                    <Label htmlFor="name">Account Name</Label>
                    <Input
                      name="name"
                      id="name"
                      placeholder="My CardDAV Account"
                      required
                    />
                  </Field>
                  <p className="text-sm text-muted-foreground">
                    A friendly name to identify this account
                  </p>
                </div>

                <div className="space-y-2">
                  <Field>
                    <Label htmlFor="server">Server URL</Label>
                    <div className="flex items-center">
                      <div className="flex items-center border rounded-l-md px-3 bg-muted">
                        {presets[0].ssl ? (
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
                  </Field>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Field>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      name="username"
                      id="username"
                      placeholder="username or email"
                      required
                    />
                  </Field>
                </div>

                <div className="space-y-2">
                  <Field>
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
                  </Field>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Field>
                    <Label htmlFor="syncFrequency">Sync Frequency</Label>
                    <Select name="syncFrequency">
                      <option value="manual">Manual only</option>
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </Select>
                  </Field>
                </div>

                <div className="space-y-2">
                  <Field>
                    <Label htmlFor="useSSL" className="block mb-2">
                      Security
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        name="useSSL"
                        id="useSSL"
                        checked={presets[0].ssl}
                      />
                      <Label htmlFor="useSSL">Use SSL/TLS (recommended)</Label>
                    </div>
                  </Field>
                </div>
              </div>

              <div className="space-y-2">
                <Field>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    name="description"
                    id="description"
                    placeholder="Additional notes about this account"
                    className="min-h-[80px]"
                  />
                </Field>
              </div>

              {/* Accordion replaced with a details/summary section */}
              <div className="w-full">
                <details className="border rounded-md">
                  <summary className="cursor-pointer px-4 py-2 font-medium select-none">
                    Advanced Settings
                  </summary>
                  <div className="space-y-4 pt-2 px-4 pb-4">
                    <div className="space-y-2">
                      <Field>
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
                      </Field>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Field>
                          <Switch name="syncAllContacts" id="syncAllContacts" />
                          <Label htmlFor="syncAllContacts">
                            Sync all contacts
                          </Label>
                        </Field>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Field>
                          <Switch name="syncGroups" id="syncGroups" />
                          <Label htmlFor="syncGroups">
                            Sync contact groups
                          </Label>
                        </Field>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Field>
                          <Switch name="syncPhotos" id="syncPhotos" />
                          <Label htmlFor="syncPhotos">
                            Sync contact photos
                          </Label>
                        </Field>
                      </div>
                    </div>
                  </div>
                </details>
              </div>
            </div>
            <div className="flex justify-between items-center p-6 border-t">
              <Button
                type="button"
                onClick={() => window.location.assign("/dashboard")}
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
            </div>
          </form>
        </div>
      )}

      {tab === "presets" && (
        <div className="bg-white border rounded-xl shadow">
          <div className="p-6 border-b">
            <div className="text-xl font-semibold mb-1">
              Common CardDAV Providers
            </div>
            <div className="text-gray-500">
              Select a preset for popular CardDAV providers to simplify setup
            </div>
          </div>
          <div className="p-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {presets.map((preset) => (
                <div
                  key={preset.name}
                  className="border rounded-xl p-4 hover:border-primary/50 transition-colors cursor-pointer bg-white"
                  onClick={() => {
                    document.getElementById("manual-tab")?.click();
                  }}
                >
                  <div className="text-lg font-semibold mb-2">
                    {preset.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {preset.server}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="p-6 border-t">
            <p className="text-sm text-muted-foreground">
              Select a preset to pre-fill the server details, then complete your
              account information
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
