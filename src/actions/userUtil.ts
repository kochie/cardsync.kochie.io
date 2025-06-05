import { clientConfig, serverConfig } from "@/config";
import { app } from "@/firebase";
import { getAuth, signInWithCustomToken } from "firebase/auth";
import { getValidCustomToken } from "next-firebase-auth-edge/next/client";
import { verifyNextCookies } from "next-firebase-auth-edge/next/cookies";
import { cookies, headers } from "next/headers";

export async function getUser() {
  const auth = getAuth(app);

  const tokens = await verifyNextCookies(await cookies(), await headers(), {
    ...serverConfig,
    ...clientConfig,
  });

  if (!tokens || !tokens.customToken) {
    console.error("No custom token provided");
    throw new Error("No custom token provided");
  }

  const customToken = await getValidCustomToken({
    serverCustomToken: tokens.customToken,
    refreshTokenUrl: "/api/refresh-token",
  });

  if (!customToken) {
    console.error("Invalid custom token");
    throw new Error("Invalid custom token");
  }
  const { user } = await signInWithCustomToken(auth, customToken);

  return user;
}
