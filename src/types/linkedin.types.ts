export interface LinkedInGraphQLResponse {
  data: LinkedInData;
//   extensions?: any; // You can expand this if needed
}

export interface LinkedInData {
  _recipeType: string;
  _type: string;
  identityDashProfilesByMemberIdentity: {
    _type: string;
    _recipeType: string;
    elements: LinkedInProfile[];
  };
}

export interface LinkedInProfile {
  birthDateOn?: {
    _type: string;
    _recipeType: string;
    month: number;
    day: number;
  };
  lastName: string;
  address: string | null;
  instantMessengers: InstantMessenger[];
  _type: string;
  _recipeType: string;
  weChatContactInfo: WeChatContactInfo | null;
  privacySettings: PrivacySettings;
  twitterHandles: TwitterHandle[];
  phoneNumbers: PhoneNumber[];
  firstName: string;
  emailAddress?: EmailAddress;
  entityUrn: string;
  memberRelationship: MemberRelationship;
  websites: Website[];
  publicIdentifier: string;
}

export interface InstantMessenger {
  provider: string;
  id: string;
}

export interface WeChatContactInfo {
  name: string;
  qr: string;
  qrCodeImageUrl: string;
}

export interface PrivacySettings {
  followPrimarySettingEnabled: boolean;
  eligibleForOneClickFollow: boolean;
  entityUrn: string;
  _type: string;
  _recipeType: string;
}

export interface TwitterHandle {
  name: string;
  credentialId: string;
}

export interface PhoneNumber {
  _type: string;
  _recipeType: string;
  type: "MOBILE" | "HOME" | "WORK" | string;
  phoneNumber: {
    _type: string;
    _recipeType: string;
    number: string;
  };
}

export interface EmailAddress {
  _type: string;
  _recipeType: string;
  emailAddress: string;
  type: string | null;
}

export interface MemberRelationship {
  _type: string;
  _recipeType: string;
  entityUrn: string;
  memberRelationship: {
    self?: { __typename: string };
    connection?: unknown;
    noConnection?: unknown;
  };
  memberRelationshipDataResolutionResult: unknown | null;
}

export interface Website {
  _type: string;
  _recipeType: string;
  category: "PERSONAL" | "BLOG" | "COMPANY" | string;
  url: string;
  label: string | null;
}