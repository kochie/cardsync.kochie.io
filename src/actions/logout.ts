'use server';
 
import {removeServerCookies} from "next-firebase-auth-edge/next/cookies";
import {getAuth, signOut} from 'firebase/auth';
import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
import {serverConfig} from '@/config';
import { app } from "@/firebase";
 
export async function logoutAction() {
  await signOut(getAuth(app));
 
  // Since Next.js 15, `headers` and `cookies` functions return a Promise, hence we precede the calls with `await`.
  removeServerCookies(await cookies(), { cookieName: serverConfig.cookieName });
  redirect('/');
}