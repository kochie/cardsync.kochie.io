"use client"

import CardDavConnection from "@/components/CardDavConnection/CardDavConnection"
import { Heading } from "@/components/ui/heading"
import { Link } from "@/components/ui/link"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus } from "@fortawesome/free-solid-svg-icons"

export default function CardDAVPage() {



  return (
    <div className="flex flex-col">
      <main className="flex-1 container py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Heading className="text-2xl font-bold">CardDAV Servers</Heading>
          </div>
          <Link href={"/dashboard/carddav/add"} className="cursor-pointer flex items-center">
            <FontAwesomeIcon icon={faPlus} className="mr-2 h-4 w-4" />
            Add Account
          </Link>
        </div>

        <div>
          <div>
            <div>Manage CardDAV Accounts</div>
            <div>
              CardDAV accounts allow you to sync contacts with your devices and services
            </div>
          </div>
          <div>
            <div className="space-y-4">
              <CardDavConnection /> 
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
