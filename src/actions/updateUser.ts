"use server";

import { clientConfig, serverConfig } from "@/config";
import { getFirebaseAuth } from "next-firebase-auth-edge";
import { refreshServerCookies } from "next-firebase-auth-edge/next/cookies";
import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";

const { updateUser } = getFirebaseAuth({
  ...serverConfig.serviceAccount,
  apiKey: clientConfig.apiKey,
});

export default async function updateUserProfile(
  uid: string,
  data: { displayName?: string; photoURL?: string }
) {
  try {
    await updateUser(uid, data);
    await refreshServerCookies(await cookies(), new Headers(await headers()), {
      ...serverConfig,
      enableCustomToken: true,
      enableMultipleCookies: true,
    });
    revalidatePath("/dashboard/profile");
    // return user;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
}
