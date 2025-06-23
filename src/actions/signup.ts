"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function handleRegister(formData: FormData) {
  const supabase = await createClient();
  
  const { error } = await supabase.auth.signUp({
    email: formData.get("email") as string,
    password: formData.get("password") as string,

    options: {
      emailRedirectTo: "localhost:3000/dashboard",
      data: {
        name: formData.get("name") as string,
      },
    },
  });

  if (error) {
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/");
}
