"use server"

import { deleteDoc, doc, getFirestore } from "firebase/firestore";
import { getUser } from "./userUtil"
import { app } from "@/firebase";

export async function deleteCardDavAction(cardId: string) {
    try {
        const user = await getUser()

        const db = getFirestore(app);

        await deleteDoc(doc(db, "users", user.uid, "carddav", cardId));
    } catch (error) {
        console.error("Error deleting CardDav account:", error);
    }
}
