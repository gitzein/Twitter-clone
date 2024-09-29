import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const useDeletePost = (postId, feedType) => {
  const queryClient = useQueryClient();

  const {
    mutate: deletePost,
    isPending: isDeleting,
    error,
  } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`/api/posts/delete/${postId}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (res.status === 400 || res.status === 401) {
          throw new Error(data.message || "Something went wrong");
        } else if (!res.ok) {
          throw new Error("Something went wrong");
        }
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess: () => {
      toast.success("Post deleted");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: () => toast.error(error.message),
  });

  return { deletePost, isDeleting };
};
