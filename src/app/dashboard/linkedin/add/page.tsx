"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, ChevronRight, Linkedin, Users } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import {parse} from "cookie"
import { addLinkedinCookie } from "@/actions/addLinkedinCreds"
import { Label } from "@/components/ui/fieldset"

export default function LinkedInConnectionPage() {
  const [cookieValue, setCookieValue] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [jsessionValue, setJsessionValue] = useState("")
  const [linkedinSessionValue, setLinkedinSessionValue] = useState("")
  const [connectionName, setConnectionName] = useState("")

  const handleConnect = async () => {
    setIsSubmitting(true)
    // Simulate API call
    try {
      addLinkedinCookie(cookieValue, connectionName)
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    const cookies = parse(cookieValue)
    const sessionId = cookies["JSESSIONID"]
    if (sessionId) {
      setJsessionValue(sessionId)
    } else {
      setJsessionValue("")
    }

    const liAt = cookies["li_at"]
    if (liAt) {
      setLinkedinSessionValue(liAt)
    } else {
      setLinkedinSessionValue("")
    }

  }, [cookieValue])

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
            <Link href="/dashboard/connections/add" className="hover:text-foreground">
              Add
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span>LinkedIn</span>
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
            <Linkedin className="h-6 w-6 text-blue-600" />
            Connect LinkedIn
          </h1>
        </div>

        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow border border-gray-200">
          <div className="p-6 border-b">
            <div className="text-xl font-semibold mb-1">LinkedIn Session Cookie Authentication</div>
            <div className="text-gray-500">
              LinkedIn doesn&apos;t provide an official API for contacts. We&apos;ll use your session cookie to sync your
              connections.
            </div>
          </div>
          <div className="p-6 space-y-4">
            <Alert onClose={() => {}}>
              <AlertTitle>Your data is secure</AlertTitle>
              <AlertDescription>
                Your session cookie is encrypted and only used to sync your LinkedIn connections. We never store your
                credentials or share your data.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="li-cookie">LinkedIn Session Cookie (li_at)</Label>
              <Textarea
                id="li-cookie"
                placeholder="Paste your LinkedIn li_at cookie here"
                className="min-h-[100px]"
                value={cookieValue}
                onChange={(e) => setCookieValue(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="jsession-cookie" className="text-sm font-medium">JSESSION ID</Label>
              <Input value={jsessionValue} readOnly></Input>
            </div>

            <div>
              <Label htmlFor="linkedin-cookie" className="text-sm font-medium">LinkedIn Session ID</Label>
              <Input value={linkedinSessionValue} readOnly></Input>
            </div>

            <div>
              <Label htmlFor="connection-name" className="text-sm font-medium">Connection Name</Label>
              <Input
                id="connection-name"
                placeholder="Enter a name for this connection"
                className=""
                value={connectionName}
                onChange={(e) => setConnectionName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">How to get your LinkedIn session cookie:</h3>
              <ol className="text-sm text-muted-foreground space-y-2 list-decimal pl-4">
                <li>Log in to LinkedIn in your browser</li>
                <li>Open developer tools (F12 or right-click and select &quot;Inspect&quot;)</li>
                <li>Go to the &quot;Application&quot; or &quot;Storage&quot; tab</li>
                <li>Find &quot;Cookies&quot; in the sidebar and select &quot;www.linkedin.com&quot;</li>
                <li>Look for a cookie named &quot;li_at&quot;</li>
                <li>Copy the value and paste it above</li>
              </ol>
              <div className="mt-4">
                <Image
                  width={500}
                  height={200}
                  src="/placeholder.svg?height=200&width=500"
                  alt="LinkedIn cookie screenshot"
                  className="border rounded-md"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center p-6 border-t">
            <Link href="/dashboard/connections/add">
              <Button outline>Cancel</Button>
            </Link>
            <Button onClick={handleConnect} disabled={!cookieValue.trim() || isSubmitting}>
              {isSubmitting ? "Connecting..." : "Connect LinkedIn"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
