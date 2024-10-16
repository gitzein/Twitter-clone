import { useEffect, useState } from "react";

import Posts from "../../components/common/Posts";
import CreatePost from "./CreatePost";
import { useMutationState, useQuery } from "@tanstack/react-query";
import OptimisticNewPost from "./OptimisticNewPost";

const HomePage = () => {
  const [feedType, setFeedType] = useState("forYou");

  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  const variables = useMutationState({
    filters: { mutationKey: ["newPost"], status: "pending" },
    select: (mutation) => mutation.state.variables,
  });

  return (
    <>
      <div className="flex-[4_4_0] ">
        <div className="flex w-full border-b border-neutral-700 sticky top-0 bg-[rgb(0,0,0,0.6)] backdrop-blur-md">
          <div
            className={
              "flex justify-center flex-1 p-4 hover:bg-[rgb(78,78,78,0.4)] transition duration-300 cursor-pointer relative " +
              (feedType !== "forYou" && "text-slate-500")
            }
            onClick={() => setFeedType("forYou")}
          >
            For you
            {feedType === "forYou" && (
              <div className="absolute bottom-0 w-10  h-1 rounded-full bg-primary"></div>
            )}
          </div>
          <div
            className={
              "flex justify-center flex-1 p-4 hover:bg-[rgb(78,78,78,0.4)] transition duration-300 cursor-pointer relative " +
              (feedType !== "following" && "text-slate-500")
            }
            onClick={() => setFeedType("following")}
          >
            Following
            {feedType === "following" && (
              <div className="absolute bottom-0 w-10  h-1 rounded-full bg-primary"></div>
            )}
          </div>
        </div>

        <CreatePost />
        <div className=" mb-4 w-full"></div>
        {variables.length !== 0 && (
          <div className="opacity-50 showAnimation">
            <OptimisticNewPost
              authUser={authUser}
              text={variables[0].text}
              img={variables[0].img}
            />
          </div>
        )}

        <Posts feedType={feedType} />
      </div>
    </>
  );
};
export default HomePage;
