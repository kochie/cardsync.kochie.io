"use client";

import { AddressBook } from "@/models/addressBook";
import { createClient } from "@/utils/supabase/client";
import { useCallback, useEffect, useState } from "react";

export default function AddressBooksPage() {
  const supabase = createClient();

  const [addressBooks, setAddressBooks] = useState<AddressBook[]>([]);

  const fetchAddressBooks = useCallback(async () => {
    const { data, error } = await supabase
      .from("carddav_addressbooks")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Error fetching address books:", error);
      return;
    }
    const books = data.map((book) => AddressBook.fromDatabaseObject(book));
    setAddressBooks(books);
  }, [supabase]);

  useEffect(() => {
    fetchAddressBooks();
  }, [fetchAddressBooks]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Address Books</h1>
      <p className="text-gray-600">Manage your address books and contacts.</p>
      {/* Add components for listing, creating, and managing address books */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {addressBooks.map((book) => (
          <div
            key={book.id}
            className="p-4 border rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold">{book.name}</h2>
            <p className="text-gray-500">{book.description}</p>
            <p className="text-sm text-gray-400">
              Created at: {new Date(book.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
