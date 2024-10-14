import { useQuery } from "@tanstack/react-query";

export const useSearch = (debouncedValue) => {
  let query = "";

  if (debouncedValue.trim() !== "") {
    query = `?search=${debouncedValue}`;
  }

  const {
    data: searchResult,
    isFetching: isSearching,
    isError: isSearchError,
    error: searchError,
    refetch,
  } = useQuery({
    queryKey: ["search"],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/users/search` + query);
        const data = await res.json();
        if (!res.ok) throw new Error("Something went wrong");

        return data;
      } catch (error) {
        throw error;
      }
    },
    retry: false,
  });

  return { searchResult, isSearching, searchError, isSearchError, refetch };
};
