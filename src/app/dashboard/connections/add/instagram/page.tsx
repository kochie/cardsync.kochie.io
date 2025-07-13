"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ChevronRight, Instagram, Users } from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { parse } from "cookie";
import { addInstagramCookie, testInstagramConnection } from "@/actions/connections/instagram";
import { Field, Label } from "@/components/ui/fieldset";
import { Text } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading";

export default function InstagramConnectionPage() {
  const [cookieValue, setCookieValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [sessionIdValue, setSessionIdValue] = useState("");
  const [csrftokenValue, setCsrftokenValue] = useState("");
  const [connectionName, setConnectionName] = useState("");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleConnect = async () => {
    setIsSubmitting(true);
    setMessage(null);
    
    try {
      const result = await addInstagramCookie(cookieValue, connectionName, username);
      if (result.error) {
        setMessage({ type: 'error', text: result.error });
      } else if (result.success) {
        setMessage({ type: 'success', text: result.success });
        // Clear form on success
        setCookieValue("");
        setConnectionName("");
        setUsername("");
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setMessage(null);
    
    try {
      const result = await testInstagramConnection(cookieValue, username);
      if (result.error) {
        setMessage({ type: 'error', text: result.error });
      } else if (result.success) {
        setMessage({ type: 'success', text: result.success });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred while testing' });
    } finally {
      setIsTesting(false);
    }
  };

  useEffect(() => {
    const cookies = parse(cookieValue);
    const sessionId = cookies["sessionid"];
    if (sessionId) {
      setSessionIdValue(sessionId);
    } else {
      setSessionIdValue("");
    }

    const csrftoken = cookies["csrftoken"];
    if (csrftoken) {
      setCsrftokenValue(csrftoken);
    } else {
      setCsrftokenValue("");
    }
  }, [cookieValue]);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
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
            <Link
              href="/dashboard/connections"
              className="hover:text-foreground"
            >
              Connections
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link
              href="/dashboard/connections/add"
              className="hover:text-foreground"
            >
              Add
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span>Instagram</span>
          </div>
        </div>
      </header>
      <main className="flex-1 container py-6">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/dashboard/connections/add">
            <Button>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Instagram className="h-6 w-6 text-pink-600" />
            Connect Instagram
          </h1>
        </div>

        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow border border-gray-200">
          <div className="p-6 border-b">
            <div className="text-xl font-semibold mb-1">
              Instagram Session Cookie Authentication
            </div>
            <div className="text-gray-500">
              Instagram doesn&apos;t provide an official API for followers.
              We&apos;ll use your session cookies to sync your followers.
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <Heading>Your data is secure</Heading>
              <Text>
                Your session cookies are encrypted and only used to sync your
                Instagram followers. We never store your credentials or share
                your data.
              </Text>
            </div>

            <div className="space-y-2">
              <Field>
                <Label htmlFor="instagram-cookies">Instagram Session Cookies</Label>
                <Textarea
                  id="instagram-cookies"
                  placeholder="Paste your Instagram session cookies here (sessionid, csrftoken, etc.)"
                  className="min-h-[100px]"
                  value={cookieValue}
                  onChange={(e) => setCookieValue(e.target.value)}
                />
              </Field>
              
              {cookieValue.trim() && (
                <div className="flex gap-2">
                  <Button
                    onClick={handleTestConnection}
                    disabled={isTesting}
                    outline
                  >
                    {isTesting ? "Testing..." : "Test Connection"}
                  </Button>
                </div>
              )}
            </div>

            <Field>
              <Label htmlFor="instagram-username" className="text-sm font-medium">
                Instagram Username
              </Label>
              <Input
                id="instagram-username"
                placeholder="Enter your Instagram username"
                className=""
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </Field>

            <Field>
              <Label htmlFor="sessionid-cookie" className="text-sm font-medium">
                Session ID
              </Label>
              <Input value={sessionIdValue} readOnly />
            </Field>

            <Field>
              <Label htmlFor="csrftoken-cookie" className="text-sm font-medium">
                CSRF Token
              </Label>
              <Input value={csrftokenValue} readOnly />
            </Field>

            <Field>
              <Label htmlFor="connection-name" className="text-sm font-medium">
                Connection Name
              </Label>
              <Input
                id="connection-name"
                placeholder="Enter a name for this connection"
                className=""
                value={connectionName}
                onChange={(e) => setConnectionName(e.target.value)}
              />
            </Field>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">
                How to get your Instagram session cookies:
              </h3>
              <ol className="text-sm text-muted-foreground space-y-2 list-decimal pl-4">
                <li>Log in to Instagram in your browser</li>
                <li>
                  Open developer tools (F12 or right-click and select
                  &quot;Inspect&quot;)
                </li>
                <li>
                  Go to the &quot;Application&quot; or &quot;Storage&quot; tab
                </li>
                <li>
                  Find &quot;Cookies&quot; in the sidebar and select
                  &quot;www.instagram.com&quot;
                </li>
                <li>Look for cookies named &quot;sessionid&quot; and &quot;csrftoken&quot;</li>
                <li>Copy all cookie values and paste them above</li>
              </ol>
              <div className="mt-4">
                <Image
                  width={500}
                  height={200}
                  src="/placeholder.svg?height=200&width=500"
                  alt="Instagram cookies screenshot"
                  className="border rounded-md"
                />
              </div>
            </div>

            {message && (
              <div className={`p-4 rounded-lg border ${
                message.type === 'success' 
                  ? 'bg-green-50 border-green-200 text-green-800' 
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                <div className="text-sm font-medium">
                  {message.type === 'success' ? '✅ Success' : '❌ Error'}
                </div>
                <div className="text-sm mt-1">{message.text}</div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">
                ⚠️ Important Notes
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Instagram has strict rate limits - syncing may take time</li>
                <li>• Only public accounts can be fully synced</li>
                <li>• Private accounts will show limited information</li>
                <li>• Session cookies expire periodically and may need renewal</li>
              </ul>
            </div>
          </div>
          <div className="flex justify-between items-center p-6 border-t">
            <Link href="/dashboard/connections/add">
              <Button outline>Cancel</Button>
            </Link>
            <Button
              onClick={handleConnect}
              disabled={!cookieValue.trim() || !username.trim() || isSubmitting}
            >
              {isSubmitting ? "Connecting..." : "Connect Instagram"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
} 