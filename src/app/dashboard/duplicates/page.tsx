"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Radio, RadioField, RadioGroup  } from "@/components/ui/radio"
import { ArrowLeft, Check, ChevronRight, Facebook, Linkedin, Mail, Phone, Slack, Users } from "lucide-react"
import { Label } from "@/components/ui/fieldset"

export default function DuplicatesPage() {
  const [currentDuplicate, setCurrentDuplicate] = useState(0)
  const [selectedFields, setSelectedFields] = useState({
    name: "contact1",
    email: "contact1",
    phone: "contact2",
    company: "contact1",
    title: "contact2",
  })

  const duplicates = [
    {
      id: 1,
      contact1: {
        name: "John Smith",
        email: "john.smith@example.com",
        phone: "+1 (555) 123-4567",
        company: "Acme Inc",
        title: "Product Manager",
        source: "LinkedIn",
      },
      contact2: {
        name: "John A. Smith",
        email: "johnsmith@gmail.com",
        phone: "+1 (555) 987-6543",
        company: "Acme Incorporated",
        title: "Senior Product Manager",
        source: "Facebook",
      },
    },
    {
      id: 2,
      contact1: {
        name: "Sarah Johnson",
        email: "sarah.j@company.com",
        phone: "+1 (555) 222-3333",
        company: "Tech Solutions",
        title: "Developer",
        source: "Slack",
      },
      contact2: {
        name: "Sarah Johnson",
        email: "sarah@gmail.com",
        phone: "+1 (555) 444-5555",
        company: "Tech Solutions LLC",
        title: "Software Developer",
        source: "LinkedIn",
      },
    },
  ]

  const handleFieldChange = (field: string, value: string) => {
    setSelectedFields({
      ...selectedFields,
      [field]: value,
    })
  }

  const handleNext = () => {
    if (currentDuplicate < duplicates.length - 1) {
      setCurrentDuplicate(currentDuplicate + 1)
    }
  }

  const handlePrevious = () => {
    if (currentDuplicate > 0) {
      setCurrentDuplicate(currentDuplicate - 1)
    }
  }

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "LinkedIn":
        return <Linkedin className="h-4 w-4 text-blue-600" />
      case "Facebook":
        return <Facebook className="h-4 w-4 text-blue-600" />
      case "Slack":
        return <Slack className="h-4 w-4 text-purple-600" />
      default:
        return null
    }
  }

  const duplicate = duplicates[currentDuplicate]

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
            <span>Duplicate Resolution</span>
          </div>
        </div>
      </header>
      <main className="flex-1 container py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Link href="/dashboard">
              <Button>
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Resolve Duplicate Contacts</h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge>
              {currentDuplicate + 1} of {duplicates.length}
            </Badge>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Potential Duplicate Contacts</CardTitle>
            <CardDescription>
              Select which information to keep from each contact to create a merged contact
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-10 w-10" src="/placeholder-user.jpg" initials={duplicate.contact1.name.charAt(0)}>
                      </Avatar>
                      <div>
                        <div className="font-medium">{duplicate.contact1.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          {getSourceIcon(duplicate.contact1.source)}
                          {duplicate.contact1.source}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <Mail className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div className="text-sm">{duplicate.contact1.email}</div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Phone className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div className="text-sm">{duplicate.contact1.phone}</div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Users className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div className="text-sm">{duplicate.contact1.company}</div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Badge className="text-xs font-normal">
                        {duplicate.contact1.title}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-10 w-10" src="/placeholder-user.jpg" initials={duplicate.contact2.name.charAt(0)}>
                      </Avatar>
                      <div>
                        <div className="font-medium">{duplicate.contact2.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          {getSourceIcon(duplicate.contact2.source)}
                          {duplicate.contact2.source}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <Mail className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div className="text-sm">{duplicate.contact2.email}</div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Phone className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div className="text-sm">{duplicate.contact2.phone}</div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Users className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div className="text-sm">{duplicate.contact2.company}</div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Badge className="text-xs font-normal">
                        {duplicate.contact2.title}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-4">Select fields to keep for the merged contact</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 items-center">
                    <div className="font-medium text-sm">Name</div>
                    <RadioGroup
                      value={selectedFields.name}
                      onChange={(value) => handleFieldChange("name", value)}
                      className="flex col-span-2"
                    >
                      <RadioField className="flex items-center space-x-2">
                        <Radio value="contact1" id="name-1" />
                        <Label htmlFor="name-1">{duplicate.contact1.name}</Label>
                      </RadioField>
                      <RadioField className="flex items-center space-x-2 ml-4">
                        <Radio value="contact2" id="name-2" />
                        <Label htmlFor="name-2">{duplicate.contact2.name}</Label>
                      </RadioField>
                    </RadioGroup>
                  </div>

                  <div className="grid grid-cols-3 gap-4 items-center">
                    <div className="font-medium text-sm">Email</div>
                    <RadioGroup
                      value={selectedFields.email}
                      onChange={(value) => handleFieldChange("email", value)}
                      className="flex col-span-2"
                    >
                      <RadioField className="flex items-center space-x-2">
                        <Radio value="contact1" id="email-1" />
                        <Label htmlFor="email-1">{duplicate.contact1.email}</Label>
                      </RadioField>
                      <RadioField className="flex items-center space-x-2 ml-4">
                        <Radio value="contact2" id="email-2" />
                        <Label htmlFor="email-2">{duplicate.contact2.email}</Label>
                      </RadioField>
                    </RadioGroup>
                  </div>

                  <div className="grid grid-cols-3 gap-4 items-center">
                    <div className="font-medium text-sm">Phone</div>
                    <RadioGroup
                      value={selectedFields.phone}
                      onChange={(value) => handleFieldChange("phone", value)}
                      className="flex col-span-2"
                    >
                      <RadioField className="flex items-center space-x-2">
                        <Radio value="contact1" id="phone-1" />
                        <Label htmlFor="phone-1">{duplicate.contact1.phone}</Label>
                      </RadioField>
                      <RadioField className="flex items-center space-x-2 ml-4">
                        <Radio value="contact2" id="phone-2" />
                        <Label htmlFor="phone-2">{duplicate.contact2.phone}</Label>
                      </RadioField>
                    </RadioGroup>
                  </div>

                  <div className="grid grid-cols-3 gap-4 items-center">
                    <div className="font-medium text-sm">Company</div>
                    <RadioGroup
                      value={selectedFields.company}
                      onChange={(value) => handleFieldChange("company", value)}
                      className="flex col-span-2"
                    >
                      <RadioField className="flex items-center space-x-2">
                        <Radio value="contact1" id="company-1" />
                        <Label htmlFor="company-1">{duplicate.contact1.company}</Label>
                      </RadioField>
                      <RadioField className="flex items-center space-x-2 ml-4">
                        <Radio value="contact2" id="company-2" />
                        <Label htmlFor="company-2">{duplicate.contact2.company}</Label>
                      </RadioField>
                    </RadioGroup>
                  </div>

                  <div className="grid grid-cols-3 gap-4 items-center">
                    <div className="font-medium text-sm">Title</div>
                    <RadioGroup
                      value={selectedFields.title}
                      onChange={(value) => handleFieldChange("title", value)}
                      className="flex col-span-2"
                    >
                      <RadioField className="flex items-center space-x-2">
                        <Radio value="contact1" id="title-1" />
                        <Label htmlFor="title-1">{duplicate.contact1.title}</Label>
                      </RadioField>
                      <RadioField className="flex items-center space-x-2 ml-4">
                        <Radio value="contact2" id="title-2" />
                        <Label htmlFor="title-2">{duplicate.contact2.title}</Label>
                      </RadioField>
                    </RadioGroup>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button outline onClick={handlePrevious} disabled={currentDuplicate === 0}>
              Previous
            </Button>
            <div className="flex gap-2">
              <Button outline>Skip</Button>
              <Button onClick={handleNext}>
                {currentDuplicate < duplicates.length - 1 ? (
                  "Next"
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Finish
                  </>
                )}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}
