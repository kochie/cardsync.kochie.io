// Instagram API response types for follower listing
export interface InstagramGraphQLResponse {
  data: InstagramData;
  status: string;
}

export interface InstagramData {
  user: InstagramUser;
}

export interface InstagramUser {
  id: string;
  username: string;
  full_name: string;
  profile_pic_url: string;
  is_private: boolean;
  is_verified: boolean;
  followed_by_viewer: boolean;
  follows_viewer: boolean;
  edge_followed_by: InstagramFollowerConnection;
  edge_follow: InstagramFollowingConnection;
}

export interface InstagramFollowerConnection {
  count: number;
  page_info: InstagramPageInfo;
  edges: InstagramFollowerEdge[];
}

export interface InstagramFollowingConnection {
  count: number;
  page_info: InstagramPageInfo;
  edges: InstagramFollowingEdge[];
}

export interface InstagramPageInfo {
  has_next_page: boolean;
  end_cursor: string | null;
}

export interface InstagramFollowerEdge {
  node: InstagramFollower;
}

export interface InstagramFollowingEdge {
  node: InstagramFollowing;
}

export interface InstagramFollower {
  id: string;
  username: string;
  full_name: string;
  profile_pic_url: string;
  is_private: boolean;
  is_verified: boolean;
}

export interface InstagramFollowing {
  id: string;
  username: string;
  full_name: string;
  profile_pic_url: string;
  is_private: boolean;
  is_verified: boolean;
  followed_by_viewer: boolean;
  follows_viewer: boolean;
  requested_by_viewer: boolean;
  edge_followed_by: {
    count: number;
  };
  edge_follow: {
    count: number;
  };
  edge_mutual_followed_by: {
    count: number;
    edges: Array<{
      node: {
        username: string;
      };
    }>;
  };
}

// Instagram connection model
export interface InstagramConnectionModel {
  id: string;
  cookies: string;
  name: string;
  sessionId: string;
  userId: string;
  username: string;
  followerCount: number;
  followingCount: number;
  lastSynced?: Date;
  status: ConnectionStatus;
  syncFrequency: string;
}

export enum ConnectionStatus {
  Connected = "connected",
  Disconnected = "disconnected",
  Syncing = "syncing",
  Error = "error",
}

// Instagram contact model
export interface InstagramContactModel {
  internalId: string;
  connectionId: string;
  userId: string;
  username: string;
  fullName?: string;
  profilePicture?: string;
  isPrivate: boolean;
  isVerified: boolean;
} 