"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import Modal from "react-modal";
import { Area } from "react-easy-crop";
import { createClient } from "@/utils/supabase/client";

// Dynamically import react-easy-crop to avoid SSR issues
const Cropper = dynamic(() => import("react-easy-crop"), { ssr: false });

function getCroppedImg(
  imageSrc: string,
  croppedAreaPixels: Area,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _zoom: number
): Promise<Blob> {
  return new Promise((resolve) => {
    const image = new window.Image();
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
      }, "image/jpeg");
    };
    // Fix for some browsers: ensure image is loaded from same-origin or data URL
    image.crossOrigin = "anonymous";
  });
}

export default function ProfilePage() {
  const [displayName, setDisplayName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setDisplayName(user.user_metadata.displayName || "");
        setPhotoURL(user.user_metadata.photoURL || "");
      }
    };

    fetchUserData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setDisplayName(session.user.user_metadata.displayName || "");
        setPhotoURL(session.user.user_metadata.photoURL || "");
      } else {
        setDisplayName("");
        setPhotoURL("");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth])

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setCropImage(reader.result as string);
        setCropModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = (_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCropSave = async () => {
    if (!cropImage || !croppedAreaPixels) return;
    // Crop the image and convert to blob/file
    const croppedBlob = await getCroppedImg(cropImage, croppedAreaPixels, zoom);
    const croppedFile = new File([croppedBlob], "profile.jpg", {
      type: "image/jpeg",
    });
    setFile(croppedFile);
    setPhotoURL(URL.createObjectURL(croppedBlob));
    setCropModalOpen(false);
    setCropImage(null);
  };

  const handleSave = async () => {

    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error("User not authenticated");
      setSaving(false);
      return;
    }

    try {
      let newPhotoURL = photoURL;
      if (file) {
        setUploading(true);

        const { error } = await supabase.storage
          .from("assets")
          .upload(`profile-pictures/${user.id}`, file, { upsert: true });

        if (error) {
          console.error("Error uploading photo:", error);
          setUploading(false);
          return;
        }

        const { data } = supabase.storage
          .from("assets")
          .getPublicUrl(`profile-pictures/${user.id}`);
        newPhotoURL = data.publicUrl;
        setUploading(false);
      }

      await supabase.auth.updateUser({
        data: {
          displayName: displayName,
          photoURL: newPhotoURL,
        },
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="flex-1 container py-6 mx-auto">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      <form
        className="max-w-md space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
      >
        <div>
          <label className="block font-medium mb-1">Profile Picture</label>
          <div className="flex items-center gap-4">
            <Image
              src={photoURL || "/placeholder.svg?size=80"}
              alt="Profile"
              className="w-16 h-16 rounded-full object-cover border"
              width={64}
              height={64}
            />
            <Input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              disabled={uploading}
            />
          </div>
        </div>
        <div>
          <label className="block font-medium mb-1">Display Name</label>
          <Input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            disabled={saving}
          />
        </div>
        <Button type="submit" disabled={saving || uploading}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </form>
      <Modal
        isOpen={cropModalOpen}
        onRequestClose={() => setCropModalOpen(false)}
        ariaHideApp={false}
        style={{
          content: {
            maxWidth: 400,
            margin: "auto",
            inset: 0,
            height: 500,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          },
        }}
      >
        <div className="mb-4 font-semibold">Crop your profile picture</div>
        {cropImage && (
          <div style={{ position: "relative", width: "100%", height: 300 }}>
            {/* @ts-expect-error weird types */}
            <Cropper
              image={cropImage}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
        )}
        <div className="flex justify-end gap-2 mt-4">
          <Button outline onClick={() => setCropModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCropSave}>Save</Button>
        </div>
      </Modal>
    </main>
  );
}
