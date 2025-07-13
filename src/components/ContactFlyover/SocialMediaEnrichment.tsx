"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLinkedin, faInstagram } from "@fortawesome/free-brands-svg-icons";
import { faPlus, faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";

interface SocialMediaEnrichmentProps {
  contactId: string;
  linkedinContactId?: string; // internal_id
  linkedinContactMoniker?: string; // public_identifier for display
  instagramContactId?: string; // internal_id
  instagramUsername?: string; // for display
  currentData: {
    name: string;
    title?: string;
    company?: string;
    emails: string[];
    phones: string[];
  };
  onDataEnriched: (updates: {
    name?: string;
    title?: string;
    company?: string;
    emails?: string[];
    phones?: string[];
  }) => void;
}

interface SocialMediaData {
  source: "linkedin" | "instagram";
  sourceName: string;
  data: {
    name?: string;
    title?: string;
    company?: string;
    email?: string;
    phone?: string;
    profilePicture?: string;
  };
}

export default function SocialMediaEnrichment({
  contactId,
  linkedinContactId,
  linkedinContactMoniker,
  instagramContactId,
  instagramUsername,
  currentData,
  onDataEnriched,
}: SocialMediaEnrichmentProps) {
  const [socialMediaData, setSocialMediaData] = useState<SocialMediaData[]>([]);
  const [loading, setLoading] = useState(false);
  const [applyingData, setApplyingData] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchSocialMediaData();
  }, [linkedinContactId, instagramContactId]);

  const fetchSocialMediaData = async () => {
    const data: SocialMediaData[] = [];

    // Fetch LinkedIn data if contact has LinkedIn connection
    if (linkedinContactId) {
      try {
        const { data: linkedinData } = await supabase
          .from("linkedin_contacts")
          .select("*")
          .eq("internal_id", linkedinContactId)
          .single();

        if (linkedinData) {
          data.push({
            source: "linkedin",
            sourceName: "LinkedIn",
            data: {
              name: linkedinData.full_name ?? undefined,
              title: linkedinData.headline ?? undefined,
              email: linkedinData.email_address?.[0] ?? undefined,
              phone: Array.isArray(linkedinData.phone_numbers) && linkedinData.phone_numbers.length > 0 
                ? (linkedinData.phone_numbers[0] as any)?.number ?? undefined
                : undefined,
              profilePicture: linkedinData.profile_picture ?? undefined,
            },
          });
        }
      } catch (error) {
        console.error("Error fetching LinkedIn data:", error);
      }
    }

    // Fetch Instagram data if contact has Instagram connection
    if (instagramContactId) {
      try {
        const { data: instagramData } = await supabase
          .from("instagram_contacts")
          .select("*")
          .eq("internal_id", instagramContactId)
          .single();

        if (instagramData) {
          data.push({
            source: "instagram",
            sourceName: "Instagram",
            data: {
              name: instagramData.full_name ?? undefined,
              profilePicture: instagramData.profile_picture ?? undefined,
            },
          });
        }
      } catch (error) {
        console.error("Error fetching Instagram data:", error);
      }
    }

    setSocialMediaData(data);
  };

  const applyData = async (sourceData: SocialMediaData, field: keyof SocialMediaData['data']) => {
    setApplyingData(`${sourceData.source}-${field}`);
    
    try {
      const value = sourceData.data[field];
      if (!value) return;

      const updates: any = {};
      
      switch (field) {
        case 'name':
          updates.name = value;
          break;
        case 'title':
          updates.title = value;
          break;
        case 'company':
          updates.company = value;
          break;
        case 'email':
          if (value && !currentData.emails.includes(value)) {
            updates.emails = [...currentData.emails, value];
          }
          break;
        case 'phone':
          if (value && !currentData.phones.includes(value)) {
            updates.phones = [...currentData.phones, value];
          }
          break;
      }

      onDataEnriched(updates);
      toast.success(`${sourceData.sourceName} ${field} applied successfully!`);
    } catch (error) {
      console.error("Error applying data:", error);
      toast.error("Failed to apply data");
    } finally {
      setApplyingData(null);
    }
  };

  const isDataMissing = (field: keyof SocialMediaData['data']) => {
    switch (field) {
      case 'name':
        return !currentData.name || currentData.name.trim() === '';
      case 'title':
        return !currentData.title || currentData.title.trim() === '';
      case 'company':
        return !currentData.company || currentData.company.trim() === '';
      case 'email':
        return currentData.emails.length === 0;
      case 'phone':
        return currentData.phones.length === 0;
      default:
        return false;
    }
  };

  const hasAvailableData = socialMediaData.some(sourceData => 
    Object.entries(sourceData.data).some(([field, value]) => 
      value && isDataMissing(field as keyof SocialMediaData['data'])
    )
  );

  if (!hasAvailableData) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
        Fill Missing Information from Social Media
      </h3>
      
      {socialMediaData.map((sourceData) => (
        <div key={sourceData.source} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <FontAwesomeIcon
              icon={sourceData.source === "linkedin" ? faLinkedin : faInstagram}
              className={`h-4 w-4 ${
                sourceData.source === "linkedin" ? "text-blue-600" : "text-pink-600"
              }`}
            />
            <span className="font-medium text-sm">{sourceData.sourceName}</span>
          </div>
          
          <div className="space-y-2">
            {Object.entries(sourceData.data).map(([field, value]) => {
              if (!value || field === 'profilePicture') return null;
              
              const isMissing = isDataMissing(field as keyof SocialMediaData['data']);
              const isApplying = applyingData === `${sourceData.source}-${field}`;
              
              if (!isMissing) return null;
              
              return (
                <div key={field} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {field}
                    </div>
                    <div className="text-sm font-medium truncate">
                      {value}
                    </div>
                  </div>
                  <button
                    onClick={() => applyData(sourceData, field as keyof SocialMediaData['data'])}
                    disabled={isApplying}
                    className="ml-2 p-1 text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={`Add ${field} from ${sourceData.sourceName}`}
                  >
                    {isApplying ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    ) : (
                      <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
} 