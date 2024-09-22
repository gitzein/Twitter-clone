import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const useFollow = () => {
  const queryClient = useQueryClient();

  const { mutate: follow, isPending } = useMutation({
    mutationFn: async (id) => {
      try {
        const res = await fetch(`/api/users/follow/${id}`, {
          method: "POST",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Something went wrong");
        return data;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suggestedUsers"] });
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (error) => toast.error(error.message),
  });

  return { follow, isPending };
};
