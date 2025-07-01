import { LinkedInGraphQLResponse, LinkedInProfile } from "@/types/linkedin.types";

export async function getProfileData(
  publicIdentifier: string,
  options: RequestInit,
  maxRetries = 5,
  baseDelay = 1000
): Promise<LinkedInProfile>{
  const queryId =
    "voyagerIdentityDashProfiles.c7452e58fa37646d09dae4920fc5b4b9";
  const variables = `(memberIdentity:${publicIdentifier})`;

  const queryURL = `https://www.linkedin.com/voyager/api/graphql?queryId=${queryId}&variables=${variables}`;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(queryURL, options);

      if (response.status === 429) {
        const delay = baseDelay * 2 ** attempt + Math.random() * 100;
        console.warn(`429 received. Retrying in ${Math.round(delay)}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      if (!response.ok) {
        console.error("Error fetching profile data:", response.statusText);
        break;
      }

      const data = (await response.json()) as LinkedInGraphQLResponse;
      return data.data.identityDashProfilesByMemberIdentity.elements[0];
    } catch (error) {
      console.error("Error fetching profile data:", error);
      break;
    }
  }

  return {
    publicIdentifier: publicIdentifier,
  } as LinkedInProfile;
};