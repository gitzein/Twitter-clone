import React from "react";
import { FaTrash } from "react-icons/fa";

function DeleteComfirmationModal({ id, func, type }) {
  return (
    <div>
      <button
        className="cursor-pointer hover:text-red-500"
        onClick={() =>
          document.getElementById(`delete_${type}_modal_${id}`).showModal()
        }
      >
        <div className="flex items-center gap-2">
          <FaTrash />
          <p className=" text-nowrap">{`Delete ${type}`}</p>
        </div>
      </button>
      <dialog
        id={`delete_${type}_modal_${id}`}
        className="modal cursor-default"
      >
        <div className="modal-box w-4/5 md:w-1/4 flex flex-col gap-6 max-w-5xl px-7 py-8 border border-gray-700 rounded-2xl">
          <div className="flex flex-col gap-2">
            <h3 className="font-bold text-xl">{`Delete ${type}?`}</h3>
            <p className="text-gray-500 text-base">
              This can’t be undone and it will be removed from your profile and
              the timeline of any accounts that follow you.
            </p>
          </div>
          <div className="flex flex-col justify-center w-full gap-2">
            <button
              onClick={() => {
                func();
                document.getElementById(`delete_${type}_modal_${id}`).close();
              }}
              className=" w-full text-base font-bold transition-all duration-300 py-2 bg-red-600 rounded-full hover:bg-red-700"
            >
              Delete
            </button>
            {/* if there is a button, it will close the modal */}
            <button
              className=" w-full text-base font-bold py-2 transition-all duration-300 border border-gray-700 rounded-full hover:bg-secondary"
              onClick={() =>
                document.getElementById(`delete_${type}_modal_${id}`).close()
              }
            >
              Cancel
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}

export default DeleteComfirmationModal;
