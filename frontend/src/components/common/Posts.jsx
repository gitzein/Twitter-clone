import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import { useQuery } from "@tanstack/react-query";
import RetweetedPost from "./RetweetedPost";

const Posts = ({ feedType, username, userId }) => {
  let POST_ENDPOINT;
  switch (feedType) {
    case "following":
      POST_ENDPOINT = "/api/posts/following";
      break;
    case "posts":
      POST_ENDPOINT = `/api/posts/user/${username}`;
      break;
    case "likes":
      POST_ENDPOINT = `/api/posts/likes/${userId}`;
      break;
    case "save":
      POST_ENDPOINT = `/api/posts/save`;
      break;
    default:
      POST_ENDPOINT = "/api/posts/all";
  }

  const {
    data: posts,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["posts", feedType],
    queryFn: async () => {
      try {
        const res = await fetch(POST_ENDPOINT);
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
  });

  return (
    <div className="max-w-100%">
      {(isLoading || isRefetching) && (
        <div className="flex flex-col justify-center">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      )}
      {!isLoading && !isRefetching && posts?.length === 0 && (
        <p className="text-center my-4">No posts in this tab</p>
      )}
      {!isLoading && !isRefetching && posts && (
        <div className="mb-[30vh]">
          {posts.map((post) => {
            if (post.isRetweetedPost === true) {
              return (
                <RetweetedPost key={post._id} post={post} feedType={feedType} />
              );
            } else {
              return <Post key={post._id} post={post} feedType={feedType} />;
            }
          })}
        </div>
      )}
    </div>
  );
};
export default Posts;
