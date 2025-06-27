"use server";

import { parse } from "cookie";
import { createClient } from "@/utils/supabase/server";

export interface ActionState {
  error?: string;
  success?: string;
}

export async function addLinkedinCookie(
  cookieData: string,
  connectionName: string
): Promise<ActionState> {
  if (!cookieData)
    return {
      error: "No cookie data provided",
    };

  const supabase = await createClient();

  const cookies = parse(cookieData.toString());
  const sessionId = cookies["JSESSIONID"];
  if (!sessionId)
    return {
      error: "No session ID found in cookie data",
    };

  const { error } = await supabase
    .from("linkedin_connections")
    .insert([
      {
        session_id: sessionId,
        cookies: cookieData.toString(),
        name: connectionName,
        number_contacts: 0,
        sync_frequency: "manual",
      },
    ]);

  if (error) {
    return {
      error: `Failed to add cookie: ${error.message}`,
    };
  }

  return {
    success: "Cookie added successfully",
  };
}
