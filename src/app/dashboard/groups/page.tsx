

'use client';

import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';


export default function GroupsPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {

    const fetchGroups = async () => {
      const {data, error} = await supabase.from("groups").select("*")

      if (error) {
        console.error("Error fetching groups:", error.message);
        return;
      }
      setGroups(data)
    };

    fetchGroups();
  }, [supabase]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">CalDAV Groups</h1>
      {groups.length === 0 ? (
        <p className="text-muted-foreground">No groups found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {groups.map((group) => (
            <div key={group.id} className="p-4 bg-white shadow-sm rounded-md border">
              <h2 className="text-lg font-semibold">{group.name || 'Unnamed Group'}</h2>
              <p className="text-sm text-gray-600">{group.description || 'No description'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}