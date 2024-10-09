import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const useLikePost = (postId, key1, key2) => {
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
          const newPosts = oldData.pages.map((page) => {
            return page.posts.map((post) => {
              if (post._id === postId) {
                return { ...post, likes: updatedLikes };
              } else if (post.postReference?._id === postId) {
                const newPostData = {
                  ...post.postReference,
                  likes: updatedLikes,
                };
                return { ...post, postReference: newPostData };
              }
              return post;
            });
          });

          const newPages = oldData.pages.map((page, i) => ({
            ...page,
            posts: newPosts[i],
          }));

          return { ...oldData, pages: newPages };
        } else if (key1 === "post") {
          return { ...oldData, likes: updatedLikes };
        }
      }),
  });

  return { likePost, likingPending };
};
