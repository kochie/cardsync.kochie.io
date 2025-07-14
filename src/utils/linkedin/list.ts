import { LinkedinConnection } from "@/models/linkedinContact";
import { Element, LinkedInProfileContactInfo, Root } from "@/types/linkedin.types";
import asyncPool from "tiny-async-pool";
// import { getProfileData } from "./profile";

// Helper function to add random delay simulating human behavior
function randomDelay(min: number, max: number): Promise<void> {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
}

export async function* getLinkedinConnections(connection: LinkedinConnection): AsyncGenerator<[Element, LinkedInProfileContactInfo], void, unknown> {
  const options = {
    method: "GET",
    headers: {
      cookie: connection.cookies,
      "csrf-token": connection.sessionId.replaceAll('"', ""),
    },
  };

  const count = 25;
  let isLastPage = false;
  let start = 0;

  const url = new URL(
    "https://www.linkedin.com/voyager/api/relationships/dash/connections"
  );
  url.searchParams.append("count", count.toString());
  url.searchParams.append("q", "search");
  url.searchParams.append(
    "decorationId",
    "com.linkedin.voyager.dash.deco.web.mynetwork.ConnectionListWithProfile-16"
  );

  do {
    try {
      // Add random delay between page requests (2-5 seconds)
      if (start > 0) {
        await randomDelay(2000, 5000);
      }
      
      url.searchParams.set("start", start.toString());
      const response = await fetch(url, options);
      if (!response.ok) {
        console.error("Error fetching data:", response.statusText);
        break;
      }

      const data = (await response.json()) as Root;

      const iteratorFn = async (
        el: Element
      ): Promise<[Element, LinkedInProfileContactInfo]> => {
        if (el.connectedMemberResolutionResult?.publicIdentifier) {
          return [
            el,
            // await getProfileData(
            //   el.connectedMemberResolutionResult.publicIdentifier,
            //   options
            // ),
            {
              entityUrn: el.entityUrn,
            }
          ];
        } else {
          return [
            el,
            {
              entityUrn: el.entityUrn,
            } as LinkedInProfileContactInfo,
          ];
        }
      };

      // Reduce concurrency and add delays between batches
      for await (const value of asyncPool(10, data.elements, iteratorFn)) {
        // Yield each profile as it's processed
        yield value;
        // Add small delay between profile processing (0.2-0.8 seconds)
        await randomDelay(200, 800);
      }

      if (data.elements.length < count) {
        isLastPage = true;
      }

      start += count;
    } catch (error) {
      console.error(error);
    }
  } while (!isLastPage);
}
