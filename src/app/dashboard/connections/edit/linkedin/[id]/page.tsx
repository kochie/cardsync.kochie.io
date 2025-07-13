"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";

export default function EditLinkedinConnectionPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    cookies: "",
  });

  useEffect(() => {
    const fetchConnection = async () => {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("linkedin_connections")
        .select("*")
        .eq("id", id)
        .single();
      if (error) {
        setError("Failed to load connection");
      } else if (data) {
        setForm({
          name: data.name || "",
          cookies: data.cookies || "",
        });
      }
      setLoading(false);
    };
    if (id) fetchConnection();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("linkedin_connections")
      .update({
        name: form.name,
        cookies: form.cookies,
      })
      .eq("id", id);
    setLoading(false);
    if (error) {
      setError("Failed to update connection");
    } else {
      setSuccess("Connection updated successfully");
      setTimeout(() => router.push("/dashboard/connections"), 1200);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-lg mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Edit LinkedIn Connection</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Connection Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Session Cookies</label>
          <textarea
            name="cookies"
            value={form.cookies}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            rows={3}
            required
          />
        </div>
        {error && <div className="text-red-600">{error}</div>}
        {success && <div className="text-green-600">{success}</div>}
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </div>
  );
} 