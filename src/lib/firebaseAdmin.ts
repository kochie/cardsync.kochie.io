import { serverConfig } from "@/config";
import { getApps, getApp, initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";


export function getAdminDB() {
  const app =
    getApps().some((app) => app.name === "admin-cardsync") === false
      ? initializeApp(
          {
            credential: cert(serverConfig.serviceAccount),
          },
          "admin-cardsync"
        )
      : getApp("admin-cardsync");

  return getFirestore(app);
}
