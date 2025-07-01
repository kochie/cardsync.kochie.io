import { LinkedinConnection } from "@/models/linkedinContact";
import { Element, LinkedInProfile, Root } from "@/types/linkedin.types";
import asyncPool from "tiny-async-pool";
import { getProfileData } from "./profile";

export async function getLinkedinConnections(connection: LinkedinConnection) {
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

  const profiles: [Element, LinkedInProfile][] = [];

  do {
    try {
      url.searchParams.set("start", start.toString());
      const response = await fetch(url, options);
      if (!response.ok) {
        console.error("Error fetching data:", response.statusText);
        break;
      }

      const data = (await response.json()) as Root;

      const iteratorFn = async (
        el: Element
      ): Promise<[Element, LinkedInProfile]> => {
        if (el.connectedMemberResolutionResult?.publicIdentifier) {
          return [
            el,
            await getProfileData(
              el.connectedMemberResolutionResult.publicIdentifier,
              options
            ),
          ];
        } else {
          return [
            el,
            {
              publicIdentifier: "",
            } as LinkedInProfile,
          ];
        }
      };

      

      for await (const value of asyncPool(10, data.elements, iteratorFn)) {
        profiles.push(value);
      }

      if (data.elements.length < count) {
        isLastPage = true;
      }

      start += count;
    } catch (error) {
      console.error(error);
    }
  } while (!isLastPage);

  return profiles;
}
