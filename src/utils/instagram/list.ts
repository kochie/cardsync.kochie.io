import { InstagramConnectionModel, InstagramFollower } from "@/types/instagram.types";

// Helper function to add random delay simulating human behavior
function randomDelay(min: number, max: number): Promise<void> {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
}

export async function getInstagramFollowers(connection: InstagramConnectionModel): Promise<InstagramFollower[]> {
  const followers: InstagramFollower[] = [];
  let next_max_id: string | null = null;
  const count = 50;

  do {
    try {
      // Add random delay between requests (2-5 seconds)
      if (next_max_id) {
        await randomDelay(2000, 5000);
      }

      const url: string = `https://www.instagram.com/api/v1/friendships/${connection.userId}/followers/?count=${count}` +
        (next_max_id ? `&max_id=${encodeURIComponent(next_max_id)}` : '');

      const response: Response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          "X-CSRFToken": connection.sessionId,
          "X-Requested-With": "XMLHttpRequest",
          "X-Instagram-AJAX": "1",
          "X-IG-App-ID": "936619743392459",
          "X-IG-WWW-Claim": "0",
          "Referer": "https://www.instagram.com/",
          "Origin": "https://www.instagram.com",
          "Cookie": connection.cookies,
        },
      });

      if (!response.ok) {
        console.error("Error fetching Instagram followers:", response.status, response.statusText);
        
        // Handle rate limiting
        if (response.status === 429) {
          console.warn("Rate limited by Instagram. Waiting 60 seconds...");
          await randomDelay(60000, 90000); // Wait 1-1.5 minutes
          continue;
        }
        
        throw new Error(`Instagram API error: ${response.status} ${response.statusText}`);
      }

      const data: any = await response.json();

      if (!data.users) {
        throw new Error("Instagram API did not return a users array. Check authentication and userId.");
      }

      // Convert API response to InstagramFollower format
      const convertedFollowers: InstagramFollower[] = data.users.map((user: any) => ({
        id: user.pk,
        username: user.username,
        full_name: user.full_name || user.username,
        profile_pic_url: user.profile_pic_url,
        is_private: user.is_private,
        is_verified: user.is_verified,
      }));

      followers.push(...convertedFollowers);
      next_max_id = data.next_max_id || null;

      console.log(`Fetched ${followers.length} followers so far...`);

      // Add small delay between successful requests (1-3 seconds)
      await randomDelay(1000, 3000);

    } catch (error) {
      console.error("Error fetching Instagram followers:", error);
      
      // If it's a network error, wait and retry
      if (error instanceof TypeError) {
        console.warn("Network error, retrying in 10 seconds...");
        await randomDelay(10000, 15000);
        continue;
      }
      
      throw error;
    }
  } while (next_max_id);

  console.log(`Total followers fetched: ${followers.length}`);
  return followers;
}

export async function getInstagramFollowing(connection: InstagramConnectionModel): Promise<InstagramFollower[]> {
  const following: InstagramFollower[] = [];
  let next_max_id: string | null = null;
  const count = 50;

  do {
    try {
      if (next_max_id) {
        await randomDelay(2000, 5000);
      }

      const url: string = `https://www.instagram.com/api/v1/friendships/${connection.userId}/following/?count=${count}` +
        (next_max_id ? `&max_id=${encodeURIComponent(next_max_id)}` : '');

      const response: Response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          "X-CSRFToken": connection.sessionId,
          "X-Requested-With": "XMLHttpRequest",
          "X-Instagram-AJAX": "1",
          "X-IG-App-ID": "936619743392459",
          "X-IG-WWW-Claim": "0",
          "Referer": "https://www.instagram.com/",
          "Origin": "https://www.instagram.com",
          "Cookie": connection.cookies,
        },
      });

      if (!response.ok) {
        console.error("Error fetching Instagram following:", response.status, response.statusText);
        if (response.status === 429) {
          console.warn("Rate limited by Instagram. Waiting 60 seconds...");
          await randomDelay(60000, 90000);
          continue;
        }
        throw new Error(`Instagram API error: ${response.status} ${response.statusText}`);
      }

      const data: any = await response.json();

      if (!data.users) {
        throw new Error("Instagram API did not return a users array. Check authentication and userId.");
      }

      const convertedFollowing: InstagramFollower[] = data.users.map((user: any) => ({
        id: user.pk,
        username: user.username,
        full_name: user.full_name || user.username,
        profile_pic_url: user.profile_pic_url,
        is_private: user.is_private,
        is_verified: user.is_verified,
      }));

      following.push(...convertedFollowing);
      next_max_id = data.next_max_id || null;

      console.log(`Fetched ${following.length} following so far...`);
      await randomDelay(1000, 3000);
    } catch (error) {
      console.error("Error fetching Instagram following:", error);
      if (error instanceof TypeError) {
        console.warn("Network error, retrying in 10 seconds...");
        await randomDelay(10000, 15000);
        continue;
      }
      throw error;
    }
  } while (next_max_id);

  console.log(`Total following fetched: ${following.length}`);
  return following;
}

// Function to get both followers and following (optional)
export async function getInstagramConnections(connection: InstagramConnectionModel): Promise<{
  followers: InstagramFollower[];
  following: InstagramFollower[];
}> {
  console.log("Fetching Instagram followers...");
  const followers = await getInstagramFollowers(connection);
  
  // Add longer delay between followers and following requests
  console.log("Waiting before fetching following...");
  await randomDelay(10000, 20000);
  
  console.log("Fetching Instagram following...");
  const following = await getInstagramFollowers(connection); // You'd need a separate query for following
  
  return { followers, following };
}

export async function getInstagramMutualContacts(connection: InstagramConnectionModel): Promise<InstagramFollower[]> {
  // Fetch both lists
  const [followers, following] = await Promise.all([
    getInstagramFollowers(connection),
    getInstagramFollowing(connection),
  ]);

  // Build a map of following by id for fast lookup
  const followingMap = new Map<string, InstagramFollower>();
  for (const user of following) {
    followingMap.set(user.id, user);
  }

  // Only keep users who are in both lists (mutuals)
  const mutuals: InstagramFollower[] = followers
    .filter(f => followingMap.has(f.id))
    .map(f => {
      // Merge data from both, prefer follower data, but fill in any missing fields from following
      const followData = followingMap.get(f.id)!;
      return {
        ...followData,
        ...f, // follower data takes precedence
      };
    });

  return mutuals;
}

// Helper function to convert Instagram follower to contact format
export function convertInstagramFollowerToContact(follower: InstagramFollower, connectionId: string) {
  return {
    connectionId,
    userId: follower.id,
    username: follower.username,
    fullName: follower.full_name || follower.username,
    profilePicture: follower.profile_pic_url,
    isPrivate: follower.is_private,
    isVerified: follower.is_verified,
    followerCount: 0, // No longer available in the new getInstagramFollowers
    followingCount: 0, // No longer available in the new getInstagramFollowers
    mutualFollowers: [], // No longer available in the new getInstagramFollowers
    followedByViewer: false, // No longer available in the new getInstagramFollowers
    followsViewer: false, // No longer available in the new getInstagramFollowers
    requestedByViewer: false, // No longer available in the new getInstagramFollowers
  };
}

