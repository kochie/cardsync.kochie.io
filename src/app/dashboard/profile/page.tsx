"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import Modal from "react-modal";
import { Area } from "react-easy-crop";
import { createClient } from "@/utils/supabase/client";
import toast from "react-hot-toast";
import { makePlaceholder } from "./makePlaceholder";

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
  const [email, setEmail] = useState("");

  const supabase = createClient();

  // Sends a password reset email to the user's email address
  const handleResetPassword = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email) {
      toast.error("User not authenticated");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(user.email);
    if (error) {
      console.error("Error sending reset email:", error);
      toast.error("Failed to send password reset email.");
      return;
    }

    toast.success("Password reset email sent!");
  };

  // Delete account handler
  const handleDeleteAccount = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("User not authenticated");
      return;
    }

    // Note: Requires Supabase admin privileges/service role key on backend.
    const { error } = await supabase.auth.admin.deleteUser(user.id);

    if (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete account.");
      return;
    }

    toast.success("Account deleted. Goodbye!");
    // Optional: redirect to homepage or sign-in page
    window.location.href = "/";
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setDisplayName(user.user_metadata.displayName || "");
        setPhotoURL(user.user_metadata.photoURL || "");
        setEmail(user.email || "");
      }
    };

    fetchUserData();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setDisplayName(session.user.user_metadata.displayName || "");
        setPhotoURL(session.user.user_metadata.photoURL || "");
        setEmail(session.user.email || "");
      } else {
        setDisplayName("");
        setPhotoURL("");
        setEmail("");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

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
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error("User not authenticated");
      setSaving(false);
      return;
    }

    try {
      let newPhotoURL = photoURL;
      let blurDataURL = "";
      if (file) {
        setUploading(true);

        const { error } = await supabase.storage
          .from("assets")
          .upload(`profile-pictures/${user.id}`, file, { upsert: true });

        if (error) {
          console.error("Error uploading photo:", error);
          setUploading(false);
          toast.error("Failed to upload profile picture.");
          return;
        }

        const { data } = supabase.storage
          .from("assets")
          .getPublicUrl(`profile-pictures/${user.id}`);
        newPhotoURL = data.publicUrl;

        blurDataURL = await makePlaceholder(file);
        setUploading(false);
      }

      const { error: updateError } = await supabase.auth.updateUser({
        email: email !== user.email ? email : undefined,
        data: {
          displayName: displayName,
          photoURL: newPhotoURL,
          blurDataURL,
        },
      });

      if (updateError) {
        console.error("Error updating user:", updateError);
        toast.error("Failed to update profile.");
        return;
      }

      toast.success("Profile updated successfully!");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="flex-1 container py-6 mx-auto">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      <form
        className="max-w-lg space-y-6"
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
              className="w-16 h-16 rounded-lg object-cover border"
              width={64}
              height={64}
            />
            <div>
              <p className="text-sm text-gray-500 mb-2">
                Displayed on the dashboard.
              </p>
              <label
                htmlFor="file-upload"
                className="text-sm font-medium text-blue-600 cursor-pointer hover:underline"
              >
                {uploading ? "Uploading..." : "Change profile picture"}
              </label>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                disabled={uploading}
                className="hidden"
              />
            </div>
          </div>
        </div>
        <div>
          <label className="block font-medium mb-1">Display Name</label>
          <p className="text-sm text-gray-500 mb-2">
            This name will be shown on your profile and to others.
          </p>
          <Input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            disabled={saving}
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Email Address</label>
          <p className="text-sm text-gray-500 mb-2">
            This is the email you use to sign in and receive notifications.
          </p>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={saving}
          />
          <div className="flex gap-2 mt-4">
            <Button
              type="button"
              onClick={handleResetPassword}
              outline
              className="flex-1 cursor-pointer"
            >
              Send Password Reset Email
            </Button>
            <Button
              type="submit"
              disabled={saving || uploading}
              className="flex-1 cursor-pointer"
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
          <hr className="my-6" />
          <label className="block font-medium mb-1">Delete Account</label>
          <div className="flex gap-4 items-center">
            <div>
              <p className="text-sm text-gray-500">
                Deleting your account is permanent and cannot be undone.
              </p>
            </div>

            <div>
              <Button
                type="button"
                onClick={handleDeleteAccount}
                className="w-40 cursor-pointer "
                color="red"
              >
                Delete Account
              </Button>
            </div>
          </div>
        </div>
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
          <Button
            className="cursor-pointer"
            outline
            onClick={() => setCropModalOpen(false)}
          >
            Cancel
          </Button>
          <Button className="cursor-pointer" onClick={handleCropSave}>
            Save
          </Button>
        </div>
      </Modal>
    </main>
  );
}
