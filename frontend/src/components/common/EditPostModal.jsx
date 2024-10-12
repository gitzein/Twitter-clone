import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { HiPencil } from "react-icons/hi2";
import EmojiPicker from "./EmojiPicker";

function EditPostModal({ id, text, feedType, editType, postId }) {
  const queryClient = useQueryClient();

  const [newText, setNewText] = useState(text || "");
  const {
    mutate: updatePost,
    isPending: isUpdatingPost,
    isError: isUpdatingPostError,
    error: updatePostError,
  } = useMutation({
    mutationFn: async (newText) => {
      try {
        const res = await fetch(`/api/posts/update/${id}`, {
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
      if (feedType === "post") {
        queryClient.invalidateQueries({ queryKey: [feedType, id] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["posts", feedType] });
      }
      document.getElementById(`edit_${editType}_${feedType}_${id}`).close();
      toast.success("Edited!");
    },
  });

  const {
    mutate: updateComment,
    isPending: isUpdatingComment,
    isError: isUpdatingCommentError,
    error: updateCommentError,
  } = useMutation({
    mutationFn: async (newText) => {
      try {
        const res = await fetch(`/api/posts/comment/update/${id}`, {
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
    onSuccess: (updatedComments) => {
      if (feedType === "post") {
        queryClient.setQueryData([feedType, postId], (oldData) => {
          return { ...oldData, comments: updatedComments };
        });
        document.getElementById(`edit_${editType}_${feedType}_${id}`).close();
      } else {
        queryClient.invalidateQueries({ queryKey: ["posts", feedType] });
      }
      toast.success("Edited!");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editType === "post") updatePost(newText);
    if (editType === "comment") updateComment(newText);
  };

  useEffect(() => {
    setNewText(text);
  }, [text]);

  return (
    <>
      <button
        className="flex gap-1 items-center cursor-pointer group"
        onClick={() =>
          document
            .getElementById(`edit_${editType}_${feedType}_${id}`)
            .showModal()
        }
      >
        <div className="flex items-center gap-2">
          <HiPencil />
          <p className=" text-nowrap">Edit {editType}</p>
        </div>
      </button>
      <dialog
        id={`edit_${editType}_${feedType}_${id}`}
        className="modal overflow-y-auto border-none outline-none"
      >
        <div className="modal-box justify-items-start cursor-auto self-start mt-[5vh] overflow-y-visible px-4 py-2  border rounded-2xl border-gray-700 shadow-md">
          <div className="flex pt-2 pb-4 font-bold">
            <button
              onClick={() => {
                document
                  .getElementById(`edit_${editType}_${feedType}_${id}`)
                  .close();
              }}
              className="px-2"
            >
              ✕
            </button>
          </div>
          <h3 className="font-bold text-lg my-3">Update {editType}</h3>
          <form
            className="flex flex-col gap-4"
            onSubmit={handleSubmit}
            name="edit-modal-form"
          >
            <textarea
              className="flex-1 input border border-gray-700 rounded p-2 input-md"
              value={newText}
              name="editPost"
              onChange={(e) => setNewText(e.target.value)}
            />
            <div>
              <EmojiPicker setter={setNewText} posClass={"dropdown-right"} />
            </div>
            <button
              disabled={isUpdatingCommentError || isUpdatingPostError}
              className={
                "btn rounded-full btn-sm text-white " +
                (isUpdatingCommentError || isUpdatingPostError
                  ? "bg-red-500 hover:bg-red-600"
                  : "btn-primary")
              }
              onClick={(e) => handleSubmit(e)}
            >
              {isUpdatingComment || isUpdatingPost
                ? "Updating..."
                : isUpdatingCommentError || isUpdatingPostError
                ? updatePostError?.message || updateCommentError?.message
                : "Update"}
            </button>
          </form>
        </div>
        <form
          method="dialog"
          className="modal-backdrop"
          name="close-edit-modal"
        >
          <button
            className="outline-none bg-sky-200 opacity-20  min-h-[150vh]"
            onClick={() =>
              document
                .getElementById(`edit_${editType}_${feedType}_${id}`)
                .close()
            }
          >
            close
          </button>
        </form>
      </dialog>
    </>
  );
}

export default EditPostModal;
