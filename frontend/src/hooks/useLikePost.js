import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const useLikePost = (postId, key1, key2 = "forYou") => {
  const queryClient = useQueryClient();

  const { mutate: likePost, isPending: likingPending } = useMutation({
    mutationFn: async (postId) => {
      try {
        const res = await fetch(`/api/posts/like/${postId}`, {
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
    onError: (error) => {
      toast.error("Something went wrong");
      console.log(error);
    },
    onSuccess: (updatedLikes) =>
      queryClient.setQueryData([key1, key2], (oldData) => {
        if (key1 === "posts") {
          return oldData.map((oldPost) => {
            if (oldPost._id === postId) {
              return { ...oldPost, likes: updatedLikes };
            } else if (oldPost.postReference?._id === postId) {
              const postWithNewData = {
                ...oldPost.postReference,
                likes: updatedLikes,
              };
              return { ...oldPost, postReference: postWithNewData };
            }
            return oldPost;
          });
        } else if (key1 === "post") {
          return { ...oldData, likes: updatedLikes };
        }
      }),
  });

  return { likePost, likingPending };
};
