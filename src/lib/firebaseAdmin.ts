import { CRC32C } from "@google-cloud/storage";
import { clientConfig, serverConfig } from "@/config";
import { getApps, getApp, initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";


export function getAdminDB() {
  const app = getAdminApp()

  return getFirestore(app);
}

export function getAdminStorage() {
  const app = getAdminApp();
  return getStorage(app);

}


export function getAdminApp() {
  return getApps().some((app) => app.name === "admin-cardsync")
    ? getApp("admin-cardsync")
    : initializeApp(
        {
          projectId: clientConfig.projectId,
          credential: cert(serverConfig.serviceAccount),
          storageBucket: clientConfig.storageBucket,
        },
        "admin-cardsync"
      );
}



export async function uploadToCloudStorage(
  photo: Buffer,
  contactId: string,
  userId: string
): Promise<string> {
  const filePath = `users/${userId}/contacts/${contactId}`;
  const bucket = getAdminStorage().bucket();
  const file = bucket.file(filePath);

  try {
    const [exists] = await file.exists();
    if (exists) {
      const [metadata] = await file.getMetadata();
      const remoteCRC32C = metadata.crc32c;

      const crc32c = new CRC32C();
      crc32c.update(photo);
      const localCRC32C = crc32c.toString();

      if (remoteCRC32C === localCRC32C) {
        console.log(
          `File ${filePath} already exists with matching checksum, skipping upload.`
        );
        return filePath;
      }
    }
  } catch (err) {
    console.warn("Checksum comparison failed, proceeding with upload:", err);
  }

  await file.save(photo, {
    resumable: false,
    contentType: "image/jpeg",
    metadata: {
      cacheControl: "public, max-age=31536000",
    },
  });

  console.log(`File ${filePath} uploaded successfully.`);

  return filePath;
}