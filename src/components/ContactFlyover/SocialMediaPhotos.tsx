"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { uploadImageToSupabase } from "@/utils/storage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLinkedin, faInstagram } from "@fortawesome/free-brands-svg-icons";
import { faDownload, faCheck } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface SocialMediaPhotosProps {
  contactId: string;
  linkedinContactId?: string; // internal_id
  linkedinContactMoniker?: string; // public_identifier for display
  instagramContactId?: string; // internal_id
  instagramUsername?: string; // for display
  onPhotoApplied?: () => void;
}

interface PhotoOption {
  id: string;
  url: string;
  source: "linkedin" | "instagram";
  sourceName: string;
  isApplied: boolean;
}

export default function SocialMediaPhotos({
  contactId,
  linkedinContactId,
  linkedinContactMoniker,
  instagramContactId,
  instagramUsername,
  onPhotoApplied,
}: SocialMediaPhotosProps) {
  const [photos, setPhotos] = useState<PhotoOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [applyingPhoto, setApplyingPhoto] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    fetchSocialMediaPhotos();
  }, [linkedinContactId, instagramContactId]);

  const fetchSocialMediaPhotos = async () => {
    const photoOptions: PhotoOption[] = [];

    // Fetch LinkedIn photo if contact has LinkedIn connection
    if (linkedinContactId) {
      try {
        const { data: linkedinData } = await supabase
          .from("linkedin_contacts")
          .select("profile_picture, public_identifier")
          .eq("internal_id", linkedinContactId)
          .single();

        if (linkedinData?.profile_picture) {
          photoOptions.push({
            id: `linkedin-${linkedinContactId}`,
            url: linkedinData.profile_picture,
            source: "linkedin",
            sourceName: "LinkedIn",
            isApplied: false,
          });
        }
      } catch (error) {
        console.error("Error fetching LinkedIn photo:", error);
      }
    }

    // Fetch Instagram photo if contact has Instagram connection
    if (instagramContactId) {
      try {
        const { data: instagramData } = await supabase
          .from("instagram_contacts")
          .select("profile_picture, username")
          .eq("internal_id", instagramContactId)
          .single();

        if (instagramData?.profile_picture) {
          photoOptions.push({
            id: `instagram-${instagramContactId}`,
            url: instagramData.profile_picture,
            source: "instagram",
            sourceName: "Instagram",
            isApplied: false,
          });
        }
      } catch (error) {
        console.error("Error fetching Instagram photo:", error);
      }
    }

    setPhotos(photoOptions);
  };

  const applyPhoto = async (photo: PhotoOption) => {
    if (!photo.url) return;

    setApplyingPhoto(photo.id);
    try {
      // Fetch the image from the URL via the proxy
      const response = await fetch(`/api/proxy-image?url=${encodeURIComponent(photo.url)}`);
      if (!response.ok) {
        throw new Error("Failed to fetch image");
      }

      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

      // Upload to Supabase storage
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      const path = `users/${user.id}/contacts/${contactId}`.toLowerCase();
      await uploadImageToSupabase(path, base64, supabase);

      // Always generate and store blur placeholder
      try {
        const resp = await fetch("/api/generate-blur", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contactId, imageBase64: base64 })
        });
        if (resp.ok) {
          const data = await resp.json();
          // Optionally trigger UI update
          onPhotoApplied?.();
          router.refresh(); // Invalidate path after photo/blur update
        }
      } catch (err) {
        console.error("Failed to generate blur placeholder", err);
      }

      toast.success(`Profile picture from ${photo.sourceName} applied successfully!`);
    } catch (error) {
      console.error("Error applying photo:", error);
      toast.error("Failed to apply profile picture");
    } finally {
      setApplyingPhoto(null);
    }
  };

  if (photos.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col items-start space-y-2">
      <span className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Social Media Photos</span>
      <div className="flex flex-row gap-3 items-center">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="relative group border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden flex flex-col items-center w-16 h-16 bg-white dark:bg-gray-900"
          >
            <div className="relative w-16 h-16">
              <Image
                src={photo.url}
                alt={`${photo.sourceName} profile picture`}
                fill
                className="object-cover rounded-lg"
                sizes="64px"
              />
              <button
                onClick={() => applyPhoto(photo)}
                disabled={applyingPhoto === photo.id}
                className="absolute bottom-0 left-1/2 -translate-x-1/2 mb-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-2 py-0.5 flex items-center gap-1 text-xs text-gray-700 dark:text-gray-200 shadow group-hover:bg-blue-600 group-hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={`Apply ${photo.sourceName} photo`}
                style={{ zIndex: 2 }}
              >
                <FontAwesomeIcon icon={photo.source === "linkedin" ? faLinkedin : faInstagram} className={photo.source === "linkedin" ? "text-blue-600 group-hover:text-white" : "text-pink-600 group-hover:text-white"} />
                {applyingPhoto === photo.id ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                ) : (
                  <FontAwesomeIcon icon={faDownload} className="h-3 w-3" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 