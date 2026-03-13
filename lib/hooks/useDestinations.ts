"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Destination, Category, Region } from "@/lib/types/destination";
import { SEARCH_DEBOUNCE_MS } from "@/lib/constants";

export interface DestinationFilters {
  search?: string;
  region?: Region | "all";
  category?: Category | "all";
  sort?: "name" | "rating" | "trending_score" | "created_at";
  limit?: number;
}

interface DestinationsApiResponse {
  destinations: Destination[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface UseDestinationsResult {
  destinations: Destination[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  hasMore: boolean;
  loadMore: () => void;
}

const DEFAULT_PAGINATION = {
  page: 1,
  limit: 12,
  total: 0,
  totalPages: 0,
};

export function useDestinations(filters: DestinationFilters = {}): UseDestinationsResult {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search ?? "");

  const normalized = useMemo(
    () => ({
      search: filters.search ?? "",
      region: filters.region ?? "all",
      category: filters.category ?? "all",
      sort: filters.sort ?? "trending_score",
      limit: filters.limit ?? 12,
    }),
    [filters.category, filters.limit, filters.region, filters.search, filters.sort]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(normalized.search);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [normalized.search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, normalized.region, normalized.category, normalized.sort, normalized.limit]);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchDestinations() {
      const isFirstPage = page === 1;
      setError(null);

      if (isFirstPage) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const params = new URLSearchParams({
        page: String(page),
        limit: String(normalized.limit),
        sort: normalized.sort,
      });

      if (debouncedSearch) {
        params.set("search", debouncedSearch);
      }

      if (normalized.region !== "all") {
        params.set("region", normalized.region);
      }

      if (normalized.category !== "all") {
        params.set("category", normalized.category);
      }

      try {
        const response = await fetch(`/api/destinations?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to load destinations (${response.status})`);
        }

        const payload = (await response.json()) as DestinationsApiResponse;

        setPagination(payload.pagination);
        setDestinations((current) => {
          if (isFirstPage) {
            return payload.destinations;
          }

          const existing = new Set(current.map((item) => item.id));
          const next = payload.destinations.filter((item) => !existing.has(item.id));
          return [...current, ...next];
        });
      } catch (fetchError) {
        if (controller.signal.aborted) {
          return;
        }

        setError(fetchError instanceof Error ? fetchError.message : "Failed to load destinations");
      } finally {
        if (isFirstPage) {
          setIsLoading(false);
        } else {
          setIsLoadingMore(false);
        }
      }
    }

    fetchDestinations();

    return () => controller.abort();
  }, [debouncedSearch, normalized.category, normalized.limit, normalized.region, normalized.sort, page]);

  const hasMore = pagination.page < pagination.totalPages;

  const loadMore = useCallback(() => {
    if (!isLoading && !isLoadingMore && hasMore) {
      setPage((value) => value + 1);
    }
  }, [hasMore, isLoading, isLoadingMore]);

  return {
    destinations,
    isLoading,
    isLoadingMore,
    error,
    pagination,
    hasMore,
    loadMore,
  };
}
