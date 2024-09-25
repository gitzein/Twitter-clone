import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const EditProfileModal = ({ authUser }) => {
  const navigate = useNavigate();
  const [showErrMsg, setShowErrMsg] = useState(false);
  const [currPwErr, setCurrPwErr] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    bio: "",
    link: "",
    newPassword: "",
    currentPassword: "",
  });

  const queryClient = useQueryClient();

  const {
    mutate: updateUser,
    isPending,
    error,
    isError,
  } = useMutation({
    mutationFn: async (formData) => {
      try {
        const res = await fetch("/api/users/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (res.status === 400 || res.status === 409) {
          throw new Error(data.message);
        } else if (!res.ok) {
          throw new Error("Something went wrong");
        }

        return data;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (updatedData) => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      if (authUser.username !== updatedData.username) {
        navigate(`/profile/${updatedData.username}`);
      } else {
        queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      }
      toast.success("Updated");
    },
  });

  const handleInputChange = (e) => {
    if (formData.currentPassword.length == 0) {
      setCurrPwErr(true);
    } else {
      setCurrPwErr(false);
    }
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateUser(formData);
  };

  useEffect(() => {
    setShowErrMsg(true);
    setTimeout(() => {
      setShowErrMsg(false);
    }, 4000);
  }, [isError]);

  useEffect(() => {
    if (authUser) {
      setFormData({
        fullName: authUser?.fullName,
        username: authUser?.username,
        email: authUser?.email,
        bio: authUser?.bio,
        link: authUser?.link,
        newPassword: "",
        currentPassword: "",
      });
    }
  }, [authUser]);

  return (
    <>
      <button
        className="btn btn-outline rounded-full btn-sm"
        onClick={() =>
          document.getElementById("edit_profile_modal").showModal()
        }
      >
        Edit profile
      </button>
      <dialog id="edit_profile_modal" className="modal">
        <div className="modal-box border rounded-md border-gray-700 shadow-md">
          <h3 className="font-bold text-lg my-3">Update Profile</h3>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                placeholder="Full Name"
                className="flex-1 input border border-gray-700 rounded p-2 input-md"
                value={formData.fullName}
                name="fullName"
                onChange={handleInputChange}
              />
              <input
                type="text"
                placeholder="Username"
                className="flex-1 input border border-gray-700 rounded p-2 input-md"
                value={formData.username}
                name="username"
                onChange={handleInputChange}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                type="email"
                placeholder="Email"
                className="flex-1 input border border-gray-700 rounded p-2 input-md"
                value={formData.email}
                name="email"
                onChange={handleInputChange}
              />
              <textarea
                placeholder="Bio"
                className="flex-1 input border border-gray-700 rounded p-2 input-md"
                value={formData.bio}
                name="bio"
                onChange={handleInputChange}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                type="password"
                placeholder="Current Password"
                className={
                  "flex-1 input border rounded p-2 input-md " +
                  (currPwErr ? "border-red-500" : "border-gray-700")
                }
                value={formData.currentPassword}
                name="currentPassword"
                onChange={handleInputChange}
                required
              />
              <input
                type="password"
                placeholder="New Password"
                className="flex-1 input border border-gray-700 rounded p-2 input-md"
                value={formData.newPassword}
                name="newPassword"
                onChange={handleInputChange}
              />
            </div>
            <input
              type="text"
              placeholder="Link"
              className="flex-1 input border border-gray-700 rounded p-2 input-md"
              value={formData.link}
              name="link"
              onChange={handleInputChange}
            />
            {/* {showErrMsg && (
              <div className="text-red-500 mx-auto">{error?.message}</div>
            )} */}
            <button
              disabled={currPwErr}
              className={
                "btn rounded-full btn-sm text-white " +
                (showErrMsg ? "bg-red-500 hover:bg-red-600" : "btn-primary")
              }
            >
              {isPending
                ? "Updating..."
                : showErrMsg
                ? error?.message
                : "Update"}
            </button>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button className="outline-none">close</button>
        </form>
      </dialog>
    </>
  );
};
export default EditProfileModal;
