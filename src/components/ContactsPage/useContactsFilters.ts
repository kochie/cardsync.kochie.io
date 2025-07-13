"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@uidotdev/usehooks";

interface UseContactsFiltersReturn {
  currentPage: number;
  itemsPerPage: number;
  addressBook: string | null;
  searchQuery: string | null;
  debouncedSearchTerm: string | null;
  sortField: string;
  sortDirection: "asc" | "desc";
  sourceFilter: string;
  setSearchQuery: (value: string) => void;
  setSourceFilter: (value: string) => void;
  setAddressBook: (value: string) => void;
  setItemsPerPage: (value: number) => void;
  handleSort: (field: string) => void;
  previousPage: () => string | undefined;
  nextPage: (isLastPage: boolean) => string | undefined;
}

export function useContactsFilters(): UseContactsFiltersReturn {
  const searchParams = useSearchParams();
  const router = useRouter();

  // State from URL params
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPageState] = useState(25);
  const [addressBook, setAddressBookState] = useState<string | null>(null);
  const [searchQuery, setSearchQueryState] = useState<string | null>(null);
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [sourceFilter, setSourceFilterState] = useState("all");

  const debouncedSearchTerm = useDebounce(searchQuery, 300);

  // Initialize state from URL params
  useEffect(() => {
    const page = searchParams.has("page")
      ? parseInt(searchParams.get("page") ?? "1", 10)
      : 1;
    setCurrentPage(page);

    const perPage = searchParams.has("itemsPerPage")
      ? parseInt(searchParams.get("itemsPerPage") ?? "25", 10)
      : 25;
    setItemsPerPageState(perPage);

    const book = searchParams.get("addressBook") || null;
    setAddressBookState(book);

    const search = searchParams.get("search") || "";
    setSearchQueryState(search);

    const sort = searchParams.get("sortField") || "name";
    setSortField(sort);

    const direction = (searchParams.get("sortDirection") ?? "asc") as "asc" | "desc";
    setSortDirection(direction);

    const source = searchParams.get("sourceFilter") || "all";
    setSourceFilterState(source);
  }, [searchParams]);

  // Update URL when debounced search changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (
      debouncedSearchTerm === null ||
      debouncedSearchTerm === params.get("search")
    ) {
      return;
    }

    if (debouncedSearchTerm.length > 0) {
      params.set("search", debouncedSearchTerm);
      params.set("page", "1");
    } else if (params.has("search")) {
      params.delete("search");
      params.set("page", "1");
    }

    if (window.location.search !== `?${params.toString()}`) {
      router.push(`?${params.toString()}`, { scroll: false });
    }
  }, [debouncedSearchTerm, router]);

  const setSearchQuery = useCallback((value: string) => {
    setSearchQueryState(value);
  }, []);

  const setSourceFilter = useCallback((value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    if (value && value !== "all") {
      params.set("sourceFilter", value);
    } else {
      params.delete("sourceFilter");
    }
    router.push(`?${params.toString()}`, { scroll: false });
    setSourceFilterState(value);
  }, [searchParams, router]);

  const setAddressBook = useCallback((value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    if (value) {
      params.set("addressBook", value);
    } else {
      params.delete("addressBook");
    }
    router.push(`?${params.toString()}`, { scroll: false });
  }, [searchParams, router]);

  const setItemsPerPage = useCallback((value: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    params.set("itemsPerPage", value.toString());
    router.push(`?${params.toString()}`, { scroll: false });
  }, [searchParams, router]);

  const handleSort = useCallback((field: string) => {
    const params = new URLSearchParams(searchParams);
    
    if (sortField === field) {
      const newDirection = sortDirection === "asc" ? "desc" : "asc";
      params.set("sortDirection", newDirection);
    } else {
      params.set("sortField", field);
      params.set("sortDirection", "asc");
    }
    
    router.push(`?${params.toString()}`, { scroll: false });
  }, [searchParams, router, sortField, sortDirection]);

  const previousPage = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    const page = searchParams.has("page")
      ? parseInt(searchParams.get("page") ?? "1", 10)
      : 1;
    if (page <= 1) return undefined;

    params.set("page", (page - 1).toString());
    return `?${params.toString()}`;
  }, [searchParams]);

  const nextPage = useCallback((isLastPage: boolean) => {
    const params = new URLSearchParams(searchParams);
    if (isLastPage) return undefined;

    const page = searchParams.has("page")
      ? parseInt(searchParams.get("page") ?? "1", 10)
      : 1;
    params.set("page", (page + 1).toString());
    return `?${params.toString()}`;
  }, [searchParams]);

  return {
    currentPage,
    itemsPerPage,
    addressBook,
    searchQuery,
    debouncedSearchTerm,
    sortField,
    sortDirection,
    sourceFilter,
    setSearchQuery,
    setSourceFilter,
    setAddressBook,
    setItemsPerPage,
    handleSort,
    previousPage,
    nextPage,
  };
} 