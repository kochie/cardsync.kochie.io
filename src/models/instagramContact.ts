import { Database, Tables } from "@/types/database.types";
import { InstagramContactModel } from "@/types/instagram.types";
import { SupabaseClient } from "@supabase/supabase-js";

export class InstagramContact {
  #internalId: string;
  #username: string;
  #fullName?: string;
  #profilePicture?: string;
  #isPrivate: boolean;
  #isVerified: boolean;
  #connectionId: string;
  #userId: string;

  constructor(model: InstagramContactModel) {
    this.#internalId = model.internalId;
    this.#username = model.username;
    this.#fullName = model.fullName;
    this.#profilePicture = model.profilePicture;
    this.#isPrivate = model.isPrivate;
    this.#isVerified = model.isVerified;
    this.#connectionId = model.connectionId;
    this.#userId = model.userId;
  }

  toModel(): InstagramContactModel {
    return {
      internalId: this.#internalId,
      username: this.#username,
      fullName: this.#fullName,
      profilePicture: this.#profilePicture,
      isPrivate: this.#isPrivate,
      isVerified: this.#isVerified,
        connectionId: this.#connectionId,
        userId: this.#userId
    };
  }

  static fromDatabaseObject(data: Tables<"instagram_contacts">): InstagramContact {
    return new InstagramContact({
      internalId: data.internal_id,
      username: data.username,
      fullName: data.full_name ?? undefined,
      profilePicture: data.profile_picture ?? undefined,
      isPrivate: data.is_private,
      isVerified: data.is_verified,
      connectionId: data.connection_id,
      userId: data.user_id_instagram,
    });
  }

  toDatabaseObject(): Omit<
    Tables<"instagram_contacts">,
    "internal_id" | "user_id" | "created_at"
  > {
    return {
      username: this.#username,
      full_name: this.#fullName ?? null,
      profile_picture: this.#profilePicture ?? null,
      is_private: this.#isPrivate,
      is_verified: this.#isVerified,
      connection_id: this.#connectionId,
      user_id_instagram: this.#userId,
      followed_by_viewer: true,
      follows_viewer: true,
      requested_by_viewer: false,
      follower_count: 0,
      following_count: 0,
      mutual_followers: [],
      last_synced: new Date().toISOString(),
    };
  }

  static async getByIdentifier(
    username: string,
    supabase: SupabaseClient<Database>,
    connectionIds: string[],
  ): Promise<InstagramContact | undefined> {
    const { data, error } = await supabase
      .from("instagram_contacts")
      .select("*")
      .eq("username", username)
      .in("connection_id", connectionIds)
      .single();

    if (error || !data) {
      console.error("Error fetching Instagram contact by username:", error);
      return undefined;
    }
    return this.fromDatabaseObject(data);
  }
}
