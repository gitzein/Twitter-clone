import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const useFollow = () => {
  const queryClient = useQueryClient();

  const {
    mutate: follow,
    isPending,
    isSuccess,
    status,
  } = useMutation({
    mutationFn: async (id) => {
      if (!id) return toast.error("User id must be provided");
      try {
        const res = await fetch(`/api/users/follow/${id}`, {
          method: "POST",
        });
        const data = await res.json();
        if (res.status === 400) {
          throw new Error(data.message);
        } else if (!res.ok) {
          throw new Error("Something went wrong");
        }
        return data;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["suggestedUsers"] }),
        queryClient.invalidateQueries({ queryKey: ["authUser"] }),
        queryClient.invalidateQueries({ queryKey: ["userProfile"] }),
        queryClient.invalidateQueries({ queryKey: ["userFollow"] }),
      ]);
    },
    onError: (error) => toast.error(error.message),
    retry: false,
  });

  return { follow, isPending };
};
