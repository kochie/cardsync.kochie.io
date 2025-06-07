import SocialConnections from "@/components/SocialConnections/SocialConnections";
import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { Link } from "@/components/ui/link";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function ConnectionsPage() {
  return (
    <main className="flex-1 container py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Social Connections</h1>
        <Button>
          <Link href={"/dashboard/connections/add"} className="flex items-center">
            <FontAwesomeIcon icon={faPlus} className="mr-2 h-4 w-4" />
            Add Connection
          </Link>
        </Button>
      </div>
      <p className="text-gray-500 mb-10">
        Manage your connections to various services and platforms.
      </p>
      {/* <Divider className="my-10"/> */}
      <SocialConnections />
    </main>
  );
}