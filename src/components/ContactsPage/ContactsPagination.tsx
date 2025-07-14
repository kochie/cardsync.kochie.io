"use client";

import {
  Pagination,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface ContactsPaginationProps {
  currentPage: number;
  isLastPage: boolean;
  previousPage: string | undefined;
  nextPage: string | undefined;
}

export default function ContactsPagination({
  currentPage,
  previousPage,
  nextPage,
}: ContactsPaginationProps) {
  return (
    <div className="flex items-center justify-between mt-6">
      <div className="text-sm text-muted-foreground">
        Page {currentPage}
      </div>
      <Pagination>
        <PaginationPrevious href={previousPage} />
        <PaginationNext href={nextPage} />
      </Pagination>
    </div>
  );
} 