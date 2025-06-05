"use server";

// import { createCardDav } from "@/lib/carddav";
import { redirect } from "next/navigation";
import { app } from "@/firebase";
import {
  addDoc,
  collection,
  getFirestore,
} from "firebase/firestore";


import { z } from "zod";
import { getUser } from "./userUtil";

const schema = z.object({
  username: z.string(),
  password: z.string(),
  server: z.string(),
  name: z.string(),
  syncFrequency: z.string(),
  useSSL: z.boolean(),
  description: z.string().optional(),
  addressBookPath: z.string().optional(),
  syncAllContacts: z.boolean().optional(),
  syncGroups: z.boolean().optional(),
  syncPhotos: z.boolean().optional(),
});


export async function createCardDavAction(prevState: object, formData: FormData) {
  console.log(formData);
  const db = getFirestore(app);

  const validatedFields = schema.safeParse({
    server: formData.get("server"),
    name: formData.get("name"),
    username: formData.get("username"),
    password: formData.get("password"),
    syncFrequency: formData.get("syncFrequency"),
    useSSL: formData.get("useSSL") === "true",
    description: formData.get("description"),
    addressBookPath: formData.get("addressBookPath") ?? "",
    syncAllContacts: formData.get("syncAllContacts") === "true",
    syncGroups: formData.get("syncGroups") === "true",
    syncPhotos: formData.get("syncPhotos") === "true",
  });

  if (!validatedFields.success) {
    console.error("Validation failed", validatedFields.error.flatten());
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const user = await getUser()

    await addDoc(collection(db, "users", user.uid, "carddav"), {
      server: validatedFields.data.server,
      name: validatedFields.data.name,
      username: validatedFields.data.username,
      password: validatedFields.data.password,
      syncFrequency: validatedFields.data.syncFrequency,
      useSSL: validatedFields.data.useSSL,
      description: validatedFields.data.description,
      addressBookPath: validatedFields.data.addressBookPath,
      syncAllContacts: validatedFields.data.syncAllContacts,
      syncGroups: validatedFields.data.syncGroups,
      syncPhotos: validatedFields.data.syncPhotos,
    });
  } catch (error) {
    console.error("Error verifying cookies:", error);

    return {
        errors: error
    }
  }

  redirect("/dashboard");
}
