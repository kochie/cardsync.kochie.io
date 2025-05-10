"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Download,
  Edit,
  Facebook,
  Filter,
  Linkedin,
  MoreHorizontal,
  Plus,
  Search,
  Slack,
  Trash2,
  Users,
} from "lucide-react"

// Sample data for contacts
const contactsData = [
  {
    id: 1,
    name: "John Smith",
    email: "john.smith@example.com",
    phone: "+1 (555) 123-4567",
    company: "Acme Inc",
    title: "Product Manager",
    source: "LinkedIn",
    lastUpdated: "2023-05-15T10:30:00Z",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah.j@company.com",
    phone: "+1 (555) 222-3333",
    company: "Tech Solutions",
    title: "Developer",
    source: "Slack",
    lastUpdated: "2023-05-10T14:45:00Z",
  },
  {
    id: 3,
    name: "Michael Brown",
    email: "michael.brown@gmail.com",
    phone: "+1 (555) 444-5555",
    company: "Global Enterprises",
    title: "Marketing Director",
    source: "Facebook",
    lastUpdated: "2023-05-12T09:15:00Z",
  },
  {
    id: 4,
    name: "Emily Davis",
    email: "emily.davis@outlook.com",
    phone: "+1 (555) 666-7777",
    company: "Creative Studios",
    title: "Graphic Designer",
    source: "LinkedIn",
    lastUpdated: "2023-05-14T16:20:00Z",
  },
  {
    id: 5,
    name: "David Wilson",
    email: "david.wilson@company.org",
    phone: "+1 (555) 888-9999",
    company: "Innovative Solutions",
    title: "CTO",
    source: "LinkedIn",
    lastUpdated: "2023-05-11T11:10:00Z",
  },
  {
    id: 6,
    name: "Jennifer Lee",
    email: "jennifer.lee@example.com",
    phone: "+1 (555) 111-2222",
    company: "Digital Agency",
    title: "Account Manager",
    source: "Facebook",
    lastUpdated: "2023-05-13T13:40:00Z",
  },
  {
    id: 7,
    name: "Robert Taylor",
    email: "robert.taylor@gmail.com",
    phone: "+1 (555) 333-4444",
    company: "Tech Innovations",
    title: "Software Engineer",
    source: "Slack",
    lastUpdated: "2023-05-09T15:30:00Z",
  },
  {
    id: 8,
    name: "Lisa Anderson",
    email: "lisa.anderson@company.net",
    phone: "+1 (555) 555-6666",
    company: "Global Marketing",
    title: "VP of Sales",
    source: "LinkedIn",
    lastUpdated: "2023-05-08T10:20:00Z",
  },
  {
    id: 9,
    name: "James Martin",
    email: "james.martin@outlook.com",
    phone: "+1 (555) 777-8888",
    company: "Creative Design",
    title: "UI/UX Designer",
    source: "Facebook",
    lastUpdated: "2023-05-07T14:15:00Z",
  },
  {
    id: 10,
    name: "Patricia White",
    email: "patricia.white@example.org",
    phone: "+1 (555) 999-0000",
    company: "Data Analytics Inc",
    title: "Data Scientist",
    source: "Slack",
    lastUpdated: "2023-05-06T09:45:00Z",
  },
  {
    id: 11,
    name: "Thomas Clark",
    email: "thomas.clark@company.com",
    phone: "+1 (555) 222-1111",
    company: "Financial Services",
    title: "Financial Analyst",
    source: "LinkedIn",
    lastUpdated: "2023-05-05T16:30:00Z",
  },
  {
    id: 12,
    name: "Jessica Rodriguez",
    email: "jessica.r@gmail.com",
    phone: "+1 (555) 444-3333",
    company: "Healthcare Solutions",
    title: "Project Manager",
    source: "Facebook",
    lastUpdated: "2023-05-04T11:20:00Z",
  },
]

export default function ContactsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [sourceFilter, setSourceFilter] = useState("all")
  const [sortField, setSortField] = useState("name")
  const [sortDirection, setSortDirection] = useState("asc")

  const itemsPerPage = 10

  // Filter contacts based on search query and source filter
  const filteredContacts = contactsData.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.title.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesSource = sourceFilter === "all" || contact.source === sourceFilter

    return matchesSearch && matchesSource
  })

  // Sort contacts
  const sortedContacts = [...filteredContacts].sort((a, b) => {
    let comparison = 0

    if (sortField === "name") {
      comparison = a.name.localeCompare(b.name)
    } else if (sortField === "email") {
      comparison = a.email.localeCompare(b.email)
    } else if (sortField === "company") {
      comparison = a.company.localeCompare(b.company)
    } else if (sortField === "lastUpdated") {
      comparison = new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime()
    }

    return sortDirection === "asc" ? comparison : -comparison
  })

  // Paginate contacts
  const totalPages = Math.ceil(sortedContacts.length / itemsPerPage)
  const paginatedContacts = sortedContacts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <Users className="h-5 w-5" />
            <span>ContactSync</span>
          </Link>
          <nav className="ml-auto flex items-center gap-4">
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/dashboard/contacts" className="font-medium">
              Contacts
            </Link>
            <Link href="/dashboard/duplicates">Duplicates</Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 container py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">All Contacts</h1>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Contact
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6 items-start md:items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contacts..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                  <SelectItem value="Facebook">Facebook</SelectItem>
                  <SelectItem value="Slack">Slack</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">
                  <button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort("name")}>
                    Name
                    {sortField === "name" && (
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${sortDirection === "desc" ? "rotate-180" : ""}`}
                      />
                    )}
                  </button>
                </TableHead>
                <TableHead>
                  <button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort("email")}>
                    Email
                    {sortField === "email" && (
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${sortDirection === "desc" ? "rotate-180" : ""}`}
                      />
                    )}
                  </button>
                </TableHead>
                <TableHead className="hidden md:table-cell">Phone</TableHead>
                <TableHead className="hidden lg:table-cell">
                  <button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort("company")}>
                    Company
                    {sortField === "company" && (
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${sortDirection === "desc" ? "rotate-180" : ""}`}
                      />
                    )}
                  </button>
                </TableHead>
                <TableHead className="hidden lg:table-cell">Source</TableHead>
                <TableHead className="hidden md:table-cell">
                  <button
                    className="flex items-center gap-1 hover:text-primary"
                    onClick={() => handleSort("lastUpdated")}
                  >
                    Last Updated
                    {sortField === "lastUpdated" && (
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${sortDirection === "desc" ? "rotate-180" : ""}`}
                      />
                    )}
                  </button>
                </TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedContacts.length > 0 ? (
                paginatedContacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="/placeholder-user.jpg" alt={contact.name} />
                          <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div>{contact.name}</div>
                          <div className="text-xs text-muted-foreground hidden sm:block">{contact.title}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{contact.email}</TableCell>
                    <TableCell className="hidden md:table-cell">{contact.phone}</TableCell>
                    <TableCell className="hidden lg:table-cell">{contact.company}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center gap-1">
                        {getSourceIcon(contact.source)}
                        <span>{contact.source}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{formatDate(contact.lastUpdated)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No contacts found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredContacts.length)} of {filteredContacts.length} contacts
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="icon"
                  className="w-8 h-8"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
