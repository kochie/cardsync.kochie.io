"use server"

import cookie from "cookie"
import { getAdminDB } from "@/lib/firebaseAdmin";
import { getUser } from "./getUser";

export interface ActionState {
    error?: string
    success?: string
}

const db = getAdminDB()

export async function addLinkedinCookie(cookieData: string, connectionName: string): Promise<ActionState> {
    if (!cookieData) return {
        error: "No cookie data provided"
    }

    const user = await getUser()
    if (!user) return {
        error: "User not authenticated"
    }

    const cookies = cookie.parse(cookieData.toString())
    const sessionId = cookies["JSESSIONID"]
    if (!sessionId) return {
        error: "No session ID found in cookie data"
    }

    db.collection(`users/${user.uid}/connections`).add({
        provider: "linkedin",
        sessionId: sessionId,
        cookies: cookieData.toString(),
        name: connectionName
    })

    return {
        success: "Cookie added successfully"
    }
}