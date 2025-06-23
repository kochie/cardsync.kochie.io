"use client";

import { useUser } from "@/app/context/userContext";
import SupabaseAvatar from "@/components/SupabaseAvatar";
import { Group } from "@/models/groups";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupAvatars, setGroupAvatars] = useState<
    Record<string, { blurUrl: string; name: string; id: string }[]>
  >({});
  const supabase = createClient();

  const { user } = useUser();

  useEffect(() => {
    const fetchGroups = async () => {
      const { data, error } = await supabase.from("carddav_groups").select(
        `
        *,
        carddav_addressbooks (*),
        carddav_group_members (
          *,
          carddav_contacts (id, name, photo_blur_url)
        )
        `
      );

      if (error) {
        console.error("Error fetching groups:", error.message);
        return;
      }

      console.log("Fetched groups:", data);

      setGroups(
        data.map((groupData) =>
          Group.fromDatabaseObject(
            groupData,
            groupData.carddav_addressbooks,
            groupData.carddav_group_members
              .filter((m) => m.address_book === groupData.address_book)
              .map((member) => member.member_id)
          )
        )
      );

      const avatarsByGroup: Record<
        string,
        { blurUrl: string; name: string; id: string }[]
      > = {};

      await Promise.all(
        data.map(async (groupData) => {
          avatarsByGroup[groupData.id] = groupData.carddav_group_members
            .filter((m) => m.address_book === groupData.address_book)
            .map((m) => ({
              blurUrl: m.carddav_contacts.photo_blur_url ?? "",
              name: m.carddav_contacts.name ?? "",
              id: m.carddav_contacts.id,
            }));
        })
      );

      setGroupAvatars(avatarsByGroup);
    };

    fetchGroups();
  }, [supabase]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">CalDAV Groups</h1>
      {groups.length === 0 ? (
        <p className="text-muted-foreground">No groups found.</p>
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map((group) => (
            <div
              key={group.id}
              className="p-6 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow duration-200 flex flex-col gap-4"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-base font-medium text-gray-900 truncate">
                  {group.name || "Unnamed Group"}
                </h2>
                <button className="text-sm text-blue-600 hover:underline focus:outline-none">
                  Edit
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2 min-h-[56px]">
                {(groupAvatars[group.id]?.length ?? 0) === 0 ? (
                  <span className="text-sm text-gray-400 italic">
                    No members in this group
                  </span>
                ) : (
                  <>
                    {groupAvatars[group.id].slice(0, 10).map((avatar, idx) => (
                      <div
                        key={`${group.id}-avatar-${idx}`}
                        title={avatar.name}
                      >
                        <SupabaseAvatar
                          blurDataURL={avatar.blurUrl || ""}
                          path={`users/${user?.id}/contacts/${avatar.id}`}
                          name={avatar.name}
                        />
                      </div>
                    ))}
                    {groupAvatars[group.id].length > 10 && (
                      <span className="text-sm text-gray-500 ml-2">
                        +{groupAvatars[group.id].length - 10} members
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
