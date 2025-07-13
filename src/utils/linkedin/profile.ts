import {
  LinkedInProfileContactInfo,
} from "@/types/linkedin.types";

// Helper function to add random delay simulating human behavior
function randomDelay(min: number, max: number): Promise<void> {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
}

// Fetch and merge profileView and profileContactInfo
export async function getProfileData(
  publicIdentifier: string,
  options: RequestInit,
  maxRetries = 5,
  baseDelay = 1000
): Promise<LinkedInProfileContactInfo> {
  const endpoints = [
    `https://www.linkedin.com/voyager/api/identity/profiles/${publicIdentifier}/profileView`,
    `https://www.linkedin.com/voyager/api/identity/profiles/${publicIdentifier}/profileContactInfo`,
  ];

  let profileView: Partial<LinkedInProfileContactInfo> = {};
  let profileContactInfo: Partial<LinkedInProfileContactInfo> = {};

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Add random delay before requests (1-3 seconds)
      await randomDelay(1000, 3000);
      
      // Fetch profileView
      const viewRes = await fetch(endpoints[0], options);
      if (viewRes.status === 429) {
        const delay = baseDelay * 2 ** attempt + Math.random() * 100;
        console.warn(`429 received. Retrying in ${Math.round(delay)}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      if (viewRes.ok) {
        profileView = await viewRes.json();
      }

      // Add small delay between requests (0.5-1.5 seconds)
      await randomDelay(500, 1500);
      
      // Fetch profileContactInfo
      const contactRes = await fetch(endpoints[1], options);
      if (contactRes.status === 429) {
        const delay = baseDelay * 2 ** attempt + Math.random() * 100;
        console.warn(`429 received. Retrying in ${Math.round(delay)}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      if (contactRes.ok) {
        profileContactInfo = await contactRes.json();
      }

      // Merge, preferring contactInfo for contact fields
      return {
        ...profileView,
        ...profileContactInfo,
      } as LinkedInProfileContactInfo;
    } catch (error) {
      console.error("Error fetching LinkedIn profile data:", error);
      break;
    }
  }

  // Return empty object with at least the identifier
  return {
    entityUrn: publicIdentifier,
  } as LinkedInProfileContactInfo;
}