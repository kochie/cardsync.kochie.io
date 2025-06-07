import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, ArrowRight } from "lucide-react";

export default async function Dashboard() {
  return (
    <main className="flex-1 container py-6 mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Badge
          
            color="yellow"
          >
            <AlertCircle className="h-3 w-3 mr-1" />5 duplicates need review
          </Badge>
          <Link href="/dashboard/duplicates">
            <Button >
              Resolve Duplicates
              <ArrowRight className="ml-2 h-3 w-3" />
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
