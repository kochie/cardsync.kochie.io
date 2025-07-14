"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faTimes } from "@fortawesome/free-solid-svg-icons";
import { createClient } from "@/utils/supabase/client";
import { Group } from "@/models/groups";

interface GroupCardProps {
  group: Group
  onRemove?: (groupId: string) => void;
  showRemoveButton?: boolean;
}

export default function GroupCard({
  group,
  onRemove,
  showRemoveButton = false,
}: GroupCardProps) {
  const [memberCount, setMemberCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Fetch member count for this group
    supabase
      .from("carddav_group_members")
      .select("member_id", { count: "exact", head: true })
      .eq("group_id", group.id)
      .then(({ count, error }) => {
        setIsLoading(false);
        if (error) {
          setMemberCount(0);
          return;
        }
        setMemberCount(count || 0);
      });
  }, [group.id, supabase]);

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between relative">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
              {group.name || "Unnamed Group"}
            </h4>
            {showRemoveButton && onRemove && (
              <button
                type="button"
                className="flex items-center justify-center h-5 w-5 text-gray-400 hover:text-red-500 focus:outline-none transition-colors duration-150"
                onClick={() => onRemove(group.id)}
                aria-label={`Remove from group ${group.name}`}
              >
                <FontAwesomeIcon
                  icon={faTimes}
                  fixedWidth
                  size="sm"
                  className=""
                />
              </button>
            )}
          </div>
          <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
            <FontAwesomeIcon icon={faUsers} className="mr-1" />
            {isLoading ? (
              <span className="animate-pulse">Loading...</span>
            ) : (
              <span>
                {memberCount === 1 ? "1 member" : `${memberCount} members`}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
