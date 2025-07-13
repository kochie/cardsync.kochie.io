"use server";

import { parse } from "cookie";
import { createClient } from "@/utils/supabase/server";

export interface ActionState {
  error?: string;
  success?: string;
}

export async function addInstagramCookie(
  cookieData: string,
  connectionName: string,
  username: string
): Promise<ActionState> {
  if (!cookieData)
    return {
      error: "No cookie data provided",
    };
  if (!username)
    return {
      error: "Username is required",
    };

  const supabase = await createClient();

  const cookies = parse(cookieData.toString());
  const sessionId = cookies["sessionid"];
  const csrfToken = cookies["csrftoken"];
  
  if (!sessionId)
    return {
      error: "No session ID found in cookie data",
    };

  if (!csrfToken)
    return {
      error: "No CSRF token found in cookie data",
    };

  // Test the connection before inserting and get user_id
  const testResult = await testInstagramConnection(cookieData, username);
  if (testResult.error) {
    return testResult;
  }
  // Extract user_id from testResult (if available)
  const userId = testResult.userId;
  if (!userId || !/^[0-9]+$/.test(userId)) {
    return {
      error: "Could not retrieve a valid Instagram user ID. Please check your cookies and username.",
    };
  }

  const { error } = await supabase
    .from("instagram_connections")
    .insert([
      {
        session_id: csrfToken, // Use CSRF token as session ID for API requests
        cookies: cookieData.toString(),
        name: connectionName,
        username: username,
        instagram_id: userId,
        follower_count: 0,
        following_count: 0,
        sync_frequency: "manual",
        status: "connected",
      },
    ]);

  if (error) {
    return {
      error: `Failed to add Instagram connection: ${error.message}`,
    };
  }

  return {
    success: `Instagram connection "${connectionName}" added successfully for @${username}`,
  };
}

export async function testInstagramConnection(
  cookieData: string,
  username: string
): Promise<ActionState & { userId?: string }> {
  if (!cookieData)
    return {
      error: "No cookie data provided",
    };
  if (!username)
    return {
      error: "Username is required",
    };

  const cookies = parse(cookieData.toString());
  const sessionId = cookies["sessionid"];
  const csrfToken = cookies["csrftoken"];
  
  if (!sessionId || !csrfToken)
    return {
      error: "Invalid cookie data. Missing session ID or CSRF token.",
    };

  try {
    const response = await fetch(`https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`,
      {
        method: "GET",
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          "X-CSRFToken": csrfToken,
          "X-Requested-With": "XMLHttpRequest",
          "X-Instagram-AJAX": "1",
          "X-IG-App-ID": "936619743392459",
          "X-IG-WWW-Claim": "0",
          "Referer": "https://www.instagram.com/",
          "Origin": "https://www.instagram.com",
          "Cookie": cookieData.toString(),
        },
      }
    );

    if (!response.ok) {
      console.log(response.statusText);  
      return {
        error: `Instagram API error: ${response.status} ${response.statusText}`,
      };
    }

    const data = await response.json();
    const foundUsername = data.data?.user?.username;
    const fullName = data.data?.user?.full_name;
    const followerCount = data.data?.user?.edge_followed_by?.count || 0;
    const followingCount = data.data?.user?.edge_follow?.count || 0;
    const userId = data.data?.user?.id;

    if (!foundUsername || !userId) {
      return {
        error: "Could not retrieve username or user ID from Instagram API",
      };
    }

    return {
      success: `Connection successful! Found account: @${foundUsername} (${fullName}) - ${followerCount} followers, ${followingCount} following`,
      userId,
    };
  } catch (error) {
    return {
      error: `Failed to test Instagram connection: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
} 

export async function matchInstagramByName(connectionId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("match_instagram_by_name", { p_connection_id: connectionId });
  if (error) {
    throw new Error(error.message);
  }
  return data;
} 