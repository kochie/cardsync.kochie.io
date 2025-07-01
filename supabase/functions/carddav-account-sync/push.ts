import { getCardDavSettings } from "../../../src/utils/account/connection.ts";

const push = async (cardId: string) => {
    const supabase = createClient();

  try {
    const { client } = await getCardDavSettings(cardId, supabase);

    let query = supabase
      .from("carddav_contacts")
      .select(
        `
          *,
          linkedin_contacts(*),
          carddav_addressbooks (*)
        `
      )
      .eq("carddav_addressbooks.connection_id", cardId);

    if (contactIds.length > 0) {
      query = query.in("id", contactIds);
    }

    const { data: contacts, error: contactsError } = await query;

    if (contactsError) {
      console.error(
        "Error fetching address books from database:",
        contactsError
      );
      throw new Error("Failed to fetch address books");
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("Error fetching user:", userError);
      throw new Error("Failed to fetch user");
    }

    for await (const contact of contacts) {
      console.log(
        `Updating contact: ${contact.name} (${contact.id}) - ${contact.linkedin_contacts?.public_identifier}`
      );
      const vcard = await Contact.fromDatabaseObject(contact).then((contact) =>
        contact.toVCard()
      );

      const response = await client.updateVCard({
        vCard: vcard,
      });

      if (!response.ok) {
        console.error(
          `Failed to update contact ${contact.name} (${contact.id}):`,
          response.statusText
        );
        continue;
      }
    }
  } catch (error) {
    console.error("Error during CardDAV sync:", error);
    return {
      error,
    };
  }
}