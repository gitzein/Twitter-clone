import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";

import RetweetedPost from "./RetweetedPost";
import { useEffect } from "react";
import LoadingSpinner from "./LoadingSpinner";

const Posts = ({ feedType, username, userId }) => {
  const { ref, inView } = useInView();

  let POST_ENDPOINT;
  switch (feedType) {
    case "following":
      POST_ENDPOINT = "/api/posts/following";
      break;
    case "posts":
      POST_ENDPOINT = `/api/posts/user/${username}`;
      break;
    case "likes":
      POST_ENDPOINT = `/api/posts/liked/${userId}`;
      break;
    case "save":
      POST_ENDPOINT = `/api/posts/save`;
      break;
    default:
      POST_ENDPOINT = "/api/posts/posts";
  }

  const {
    data: posts,
    status,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ["posts", feedType],
    queryFn: async ({ pageParam }) => {
      let query = "";

      if (pageParam) {
        query = `?cursor=${pageParam}&limit=10`;
      }

      try {
        const res = await fetch(POST_ENDPOINT + query);
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
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage]);

  return (
    <div className="max-w-100%">
      {status === "pending" && (
        <div className="flex flex-col justify-center">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      )}
      {status !== "pending" && posts.pages.length === 0 && (
        <p className="text-center my-4">No posts in this tab</p>
      )}
      {status !== "pending" && posts.pages.length !== 0 && (
        <div>
          {posts.pages.map((page) => {
            return (
              <div key={page.nextCursor}>
                {page.posts.map((post) => {
                  if (post.isRetweetedPost === true) {
                    return (
                      <RetweetedPost
                        key={post._id}
                        post={post}
                        feedType={feedType}
                      />
                    );
                  } else {
                    return (
                      <Post key={post._id} post={post} feedType={feedType} />
                    );
                  }
                })}
              </div>
            );
          })}
          <div ref={ref} className="mb-[30vh] w-full flex justify-center">
            {isFetchingNextPage ? (
              <LoadingSpinner size="lg" />
            ) : !hasNextPage ? (
              <p className="text-gray-700">No more post</p>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
export default Posts;
