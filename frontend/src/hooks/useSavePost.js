import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const useSavePost = () => {
  const queryClient = useQueryClient();

  const { mutate: savePost, isPending: isSavingPost } = useMutation({
    mutationFn: async (postId) => {
      try {
        const res = await fetch(`/api/posts/post/save/${postId}`, {
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
        throw error;
      }
    },
    onError: (error) => toast.error(error.message),
    onSuccess: (newData) => {
      queryClient.setQueryData(["authUser"], (oldData) => {
        return { ...oldData, savedPosts: newData };
      });
      queryClient.invalidateQueries({ queryKey: ["posts", "save"] });
    },
  });

  return { savePost, isSavingPost };
};
