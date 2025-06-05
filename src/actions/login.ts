"use server";

import { refreshCookiesWithIdToken } from "next-firebase-auth-edge/lib/next/cookies";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { app } from "@/firebase";
import { serverConfig, clientConfig } from "@/config";

export async function loginAction(username: string, password: string) {
  const credential = await signInWithEmailAndPassword(
    getAuth(app),
    username,
    password
  );

  const idToken = await credential.user.getIdToken();

  // Since Next.js 15, `headers` and `cookies` functions return a Promise, hence we precede the calls with `await`.
  await refreshCookiesWithIdToken(idToken, await headers(), await cookies(), {
    ...serverConfig,
    ...clientConfig,
  });
  redirect("/dashboard");
}
