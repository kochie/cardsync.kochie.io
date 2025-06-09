

'use client';

import { useEffect, useState } from 'react';
import { collectionGroup, getDocs, getFirestore } from 'firebase/firestore';
import { useAuth } from '@/context/AuthProvider';
import { app } from '@/firebase';

const db = getFirestore(app); // Assuming you have a function to get the Firestore instance

export default function GroupsPage() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchGroups = async () => {
      const snapshot = await getDocs(collectionGroup(db, 'groups'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGroups(data);
    };

    fetchGroups();
  }, [user]);

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