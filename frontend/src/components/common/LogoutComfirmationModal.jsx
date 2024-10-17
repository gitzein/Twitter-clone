import React from "react";
import { BiLogOut } from "react-icons/bi";
import XSvg from "../svgs/X";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

function LogoutComfirmationModal({ type }) {
  const queryClient = useQueryClient();

  const { mutate: logout } = useMutation({
    mutationKey: ["logout"],
    mutationFn: async () => {
      try {
        const res = await fetch("/api/auth/logout", {
          method: "POST",
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error("Something went wrong");
        }
        return data;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: () => {
      toast.error("Logout failed");
    },
  });

  return (
    <div>
      <button
        className="flex justify-center items-center p-2 rounded-full transition-all duration-500 hover:bg-primary"
        onClick={() =>
          document.getElementById(`logout_modal_${type}`).showModal()
        }
      >
        <BiLogOut className="w-7 h-7" />
      </button>
      <dialog id={`logout_modal_${type}`} className="modal cursor-default">
        <div className="modal-box w-4/5 md:w-1/4 flex flex-col gap-6 max-w-5xl p-7 border border-neutral-700 rounded-2xl">
          <div className="flex flex-col gap-2">
            <div to="/" className="flex justify-center ">
              <XSvg className="px-2 w-14 h-14 rounded-full fill-white" />
            </div>
            <h3 className="font-bold text-xl">Log out of X clone?</h3>
            <p className="text-gray-500 text-base">
              You can always log back in at any time. If you just want to switch
              accounts, you can't do that for now nor tomorrow. I ain't addin'
              that.
            </p>
          </div>
          <div className="flex flex-col justify-center w-full gap-2">
            <button
              onClick={() => {
                logout();
              }}
              className=" w-full text-base text-black font-bold transition-all duration-300 py-2 bg-neutral-200 rounded-full hover:bg-neutral-400"
            >
              Log out
            </button>
            {/* if there is a button, it will close the modal */}
            <button
              className=" w-full text-base font-bold py-2 transition-all duration-300 border border-neutral-700 rounded-full hover:bg-secondary"
              onClick={() =>
                document.getElementById(`logout_modal_${type}`).close()
              }
            >
              Cancel
            </button>
          </div>
        </div>
        <form
          method="dialog"
          className="modal-backdrop bg-sky-200 opacity-20"
          name="close-comment-modal"
        >
          <button
            className="outline-none"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(`logout_modal_${type}`).close();
            }}
          >
            close
          </button>
        </form>
      </dialog>
    </div>
  );
}

export default LogoutComfirmationModal;
