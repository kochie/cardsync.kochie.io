import { getDownloadURL, getStorage, ref } from "firebase/storage";
import { useEffect, useState } from "react";
import { Avatar } from "../ui/avatar";
import { app } from "@/firebase";

const storage = getStorage(app);

export default function GoogleAvatar({ path, name }: { path?: string; name: string }) {
  const [url , setUrl] = useState<string>("");

  useEffect(() => {
    async function fetchAvatar() {
      if (!path) {
        setUrl("");
        return;
      }

      try {
        const fileRef = ref(storage, path);
        const downloadUrl = await getDownloadURL(fileRef);
        console.log("Avatar URL:", downloadUrl);
        setUrl(downloadUrl);
      } catch (error) {
        console.error("Failed to fetch avatar:", error);
        setUrl("");
      }
    }
      
    fetchAvatar()
  }, [path])

  return (
    <Avatar
      className="h-12 w-12"
      initials={name
        .split(" ")
        .map((n) => n[0])
        .join("")}
      src={url}
      alt={name}
    />
  );
}