import { useEffect, useState } from "react";

import Posts from "../../components/common/Posts";
import CreatePost from "./CreatePost";
import { useMutationState, useQuery } from "@tanstack/react-query";
import OptimisticNewPost from "./OptimisticNewPost";
import XSvg from "../../components/svgs/X";
import LogoutComfirmationModal from "../../components/common/LogoutComfirmationModal";
import { Link } from "react-router-dom";

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
        <div className="flex flex-col md:flex-row w-full border-b border-neutral-700 sticky top-0 z-50 bg-[rgb(0,0,0,0.6)] backdrop-blur-md">
          <div className="flex justify-between px-4 pb-1 pt-2 md:hidden">
            <Link to={`/profile/${authUser.username}`}>
              <div className="avatar flex items-center">
                <div className="w-9 h-9 rounded-full">
                  <img
                    src={authUser?.profileImg || "/avatar-placeholder.png"}
                  />
                </div>
              </div>
            </Link>
            <XSvg className="px-2 w-10 h-10 rounded-full fill-white hover:bg-stone-900" />
            <div className="flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-500 max-w-fit cursor-pointer">
              <LogoutComfirmationModal type={"homepage"} />
            </div>
          </div>
          <div className="flex w-full">
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
