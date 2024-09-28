import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { HiPencil } from "react-icons/hi2";

function EditPostModal({ postId, text }) {
  const queryClient = useQueryClient();

  const [postText, setPostText] = useState(text || "");
  const {
    mutate: updatePost,
    isPending,
    isError,
    error,
  } = useMutation({
    mutationFn: async (newText) => {
      try {
        const res = await fetch(`/api/posts/update/${postId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: newText }),
        });
        const data = await res.json();

        if (res.status === 400 || res.status === 401) {
          throw new Error(data.message || "Something went wrong");
        } else if (!res.ok) {
          throw new Error("Something went wrong");
        }

        return data;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Edited!");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updatePost(postText);
  };
  return (
    <>
      <button
        className=" cursor-pointer hover:text-sky-400"
        onClick={() =>
          document.getElementById(`edit_post_${postId}`).showModal()
        }
      >
        <div className="flex items-center gap-2">
          <HiPencil />
          <p className=" text-nowrap">Edit post</p>
        </div>
      </button>
      <dialog id={`edit_post_${postId}`} className="modal">
        <div className="modal-box border rounded-md border-gray-700 shadow-md">
          <h3 className="font-bold text-lg my-3">Update Post</h3>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <textarea
              placeholder="Bio"
              className="flex-1 input border border-gray-700 rounded p-2 input-md"
              value={postText}
              name="bio"
              onChange={(e) => setPostText(e.target.value)}
            />

            <button
              disabled={isError}
              className={
                "btn rounded-full btn-sm text-white " +
                (isError ? "bg-red-500 hover:bg-red-600" : "btn-primary")
              }
            >
              {isPending ? "Updating..." : isError ? error?.message : "Update"}
            </button>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button className="outline-none">close</button>
        </form>
      </dialog>
    </>
  );
}

export default EditPostModal;
