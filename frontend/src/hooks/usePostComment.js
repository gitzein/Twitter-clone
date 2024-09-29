import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const usePostComment = (postId, feedType) => {
  const queryClient = useQueryClient();

  const { mutate: postComment, isPending: isCommenting } = useMutation({
    mutationFn: async (text) => {
      try {
        const res = await fetch(`/api/posts/comment/${postId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
        const data = await res.json();
        if (res.status === 400) {
          throw new Error(data.message || "Something went wrong");
        } else if (!res.ok) {
          throw new Error("Something went wrong");
        }
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: () => {
      if (feedType === "post") {
        queryClient.invalidateQueries({ queryKey: [feedType, postId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["posts", feedType] });
      }
      toast.success("Comment posted");
    },
  });

  return { postComment, isCommenting };
};
