"use client";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { createQueryString } from "@/helpers/url";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function MyPagination({ total_pages, search }) {
  const [startingPage, setStartingPage] = useState(2);
  const [maxPagesToRender, setMaxPagesToRender] = useState(
    Math.min(2, total_pages - 2)
  );
  const [lastPageNumber, setlastPageNumber] = useState(startingPage + 1);

  const [pages, setPages] = useState(
    new Array(maxPagesToRender).fill(0).map((_, idx) => startingPage + idx)
  );
  const searchParams = useSearchParams();
  const page = searchParams.get("page") || 1;
  const pathname = usePathname();
  const router = useRouter();

  const handleChangePage = (newNumber: number) => {
    if (newNumber === 0 || newNumber === total_pages + 1) return;

    router.push(
      `${pathname}?${createQueryString(
        searchParams,
        "page",
        String(newNumber),
        pathname
      )}`
    );
  };

  useEffect(() => {
    const newPages = new Array(Math.min(2, total_pages - 2))
      .fill(0)
      .map((_, idx) => startingPage + idx);
    setlastPageNumber(startingPage + 1);

    setPages(() => newPages);
  }, [startingPage, page]);

  useEffect(() => {
    setStartingPage(2);
  }, [search]);

  return (
    <Pagination>
      <PaginationContent className="mt-2">
        {+page > 1 && (
          <PaginationItem
            onClick={() => {
              handleChangePage(+page - 1);
              if (startingPage > 2 && +page < total_pages - 1) {
                setStartingPage(startingPage - 1);
              }
            }}
          >
            <PaginationPrevious />
          </PaginationItem>
        )}

        <PaginationItem
          key={1}
          onClick={() => {
            handleChangePage(1);
            setStartingPage(2);
          }}
        >
          <PaginationLink isActive={+page === 1}>1</PaginationLink>
        </PaginationItem>

        {lastPageNumber - 2 > 2 && (
          <div
            className="cursor-pointer hover:text-blue-600 px-2 user-select-none"
            onClick={() => {
              const hiddenPages = startingPage - 1;

              setStartingPage(startingPage - Math.min(2, hiddenPages));
            }}
          >
            ..
          </div>
        )}
        {pages.map((pageNumber) => {
          return (
            <PaginationItem
              className="user-select-none"
              key={pageNumber}
              onClick={() => handleChangePage(pageNumber)}
            >
              <PaginationLink isActive={+page === pageNumber}>
                {pageNumber}
              </PaginationLink>
            </PaginationItem>
          );
        })}
        {total_pages - lastPageNumber > 1 && (
          <div
            className="cursor-pointer hover:text-blue-600 px-2 user-select-none"
            onClick={() => {
              const hiddenPages = total_pages - lastPageNumber;

              setStartingPage(startingPage + Math.min(3, hiddenPages));
            }}
          >
            ..
          </div>
        )}
        <PaginationItem
          key={total_pages}
          onClick={() => {
            handleChangePage(total_pages);
            setStartingPage(total_pages - maxPagesToRender);
          }}
        >
          <PaginationLink isActive={+page === total_pages}>
            {total_pages}
          </PaginationLink>
        </PaginationItem>
        {total_pages > page && (
          <PaginationItem
            onClick={() => {
              const nextPage = +page + 1;
              handleChangePage(nextPage);

              if (total_pages > lastPageNumber && +page + 1 !== startingPage) {
                setStartingPage(startingPage + 1);
              }
            }}
          >
            <PaginationNext />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
}
