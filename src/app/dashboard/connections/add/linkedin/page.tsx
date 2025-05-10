"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, ChevronRight, Linkedin, Users } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function LinkedInConnectionPage() {
  const [cookieValue, setCookieValue] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleConnect = () => {
    setIsSubmitting(true)
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      // Redirect would happen here in a real app
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
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Linkedin className="h-6 w-6 text-blue-600" />
            Connect LinkedIn
          </h1>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>LinkedIn Session Cookie Authentication</CardTitle>
            <CardDescription>
              LinkedIn doesn't provide an official API for contacts. We'll use your session cookie to sync your
              connections.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
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

            <div className="space-y-2">
              <h3 className="text-sm font-medium">How to get your LinkedIn session cookie:</h3>
              <ol className="text-sm text-muted-foreground space-y-2 list-decimal pl-4">
                <li>Log in to LinkedIn in your browser</li>
                <li>Open developer tools (F12 or right-click and select "Inspect")</li>
                <li>Go to the "Application" or "Storage" tab</li>
                <li>Find "Cookies" in the sidebar and select "www.linkedin.com"</li>
                <li>Look for a cookie named "li_at"</li>
                <li>Copy the value and paste it above</li>
              </ol>
              <div className="mt-4">
                <img
                  src="/placeholder.svg?height=200&width=500"
                  alt="LinkedIn cookie screenshot"
                  className="border rounded-md"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Link href="/dashboard/connections/add">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button onClick={handleConnect} disabled={!cookieValue.trim() || isSubmitting}>
              {isSubmitting ? "Connecting..." : "Connect LinkedIn"}
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}
