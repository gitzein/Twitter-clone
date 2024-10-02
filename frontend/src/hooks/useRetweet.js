import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const useRetweet = (postId, feedType) => {
  const queryClient = useQueryClient();

  const { mutate: retweet, isPending: isRetweeting } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`/api/posts/retweet/${postId}`, {
          method: "POST",
        });
        const data = await res.json();

        if (res.status === 400) {
          throw new Error(data.message || "Something went wrong");
        } else if (!res.ok) {
          throw new Error("Something went wrong");
        }

        return data;
      } catch (error) {
        console.log(error);

        toast.error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: "authUser" });
      if (feedType === "post") {
        queryClient.invalidateQueries({ queryKey: ["post", postId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["posts", feedType] });
      }
    },
  });

  return { retweet, isRetweeting };
};
