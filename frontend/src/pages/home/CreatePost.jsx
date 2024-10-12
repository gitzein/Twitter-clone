import { CiImageOn } from "react-icons/ci";
import { useRef, useState } from "react";
import { IoCloseSharp } from "react-icons/io5";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import EmojiPicker from "../../components/common/EmojiPicker";

const CreatePost = () => {
  const [text, setText] = useState("");
  const [img, setImg] = useState(null);
  const [isImgSizeAllowed, setIsImgSizeAllowed] = useState(true);
  const imgRef = useRef(null);

  const { data } = useQuery({ queryKey: ["authUser"] });
  const queryClient = useQueryClient();

  const textLength = text.split("").length;
  const almostReachingTextLimit = textLength >= 270 && textLength <= 280;
  const textLimitReached = textLength > 280;

  const {
    mutate: createPostMutation,
    isPending,
    isError,
    error,
  } = useMutation({
    mutationKey: ["newPost"],
    mutationFn: async ({ text, img }) => {
      try {
        const res = await fetch("/api/posts/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, img }),
        });
        const data = await res.json();
        if (res.status === 413) {
          throw new Error("File size too large (Max 5 MB)");
        } else if (!res.ok) {
          throw new Error(data.message || "Something went wrong");
        }
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setText("");
      setImg(null);
      toast.success("Posted!");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (textLimitReached) return;
    createPostMutation({ text, img });
  };

  const handleImgChange = (e) => {
    const file = e.target.files[0];
    const size = file.size;
    if (file && size / 1024 > 5000) {
      setIsImgSizeAllowed(false);
    }
    if (file && isImgSizeAllowed) {
      const reader = new FileReader();
      reader.onload = () => {
        setImg(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex p-4 items-start gap-4 border-b border-gray-700">
      <div className="avatar">
        <div className="w-8 rounded-full">
          <img src={data?.profileImg || "/avatar-placeholder.png"} />
        </div>
      </div>
      <form
        className="flex flex-col gap-2 w-full"
        onSubmit={handleSubmit}
        name="create-post-form"
      >
        <textarea
          className="textarea w-full p-0 text-lg input-style resize-none border-none focus:outline-none  border-gray-800"
          placeholder="What is happening?!"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        {img && (
          <div className="relative w-72 mx-auto">
            <IoCloseSharp
              className="absolute top-0 right-0 text-white bg-gray-800 rounded-full w-5 h-5 cursor-pointer"
              onClick={() => {
                setImg(null);
                imgRef.current.value = null;
                setIsImgSizeAllowed(true);
              }}
            />
            <img
              src={img}
              className="w-full mx-auto h-72 object-contain rounded"
            />
          </div>
        )}

        <div className="flex justify-between border-t py-2 border-t-gray-700">
          <div className="flex gap-1 items-center">
            <CiImageOn
              className="fill-primary w-6 h-6 cursor-pointer"
              onClick={() => imgRef.current.click()}
            />

            <EmojiPicker setter={setText} />
          </div>
          <input
            type="file"
            hidden
            ref={imgRef}
            accept="image/*"
            onChange={handleImgChange}
          />
          <div className="flex gap-2 items-center">
            {textLength > 0 && (
              <div
                className={
                  "opacity-70 transition-all duration-300 " +
                  (almostReachingTextLimit
                    ? "text-yellow-500"
                    : textLimitReached
                    ? "text-red-500 font-bold"
                    : "text-gray-500")
                }
              >
                {textLimitReached
                  ? `-${textLength - 280}`
                  : `${textLength}/280`}
              </div>
            )}
            <button
              disabled={isPending || !isImgSizeAllowed || textLimitReached}
              className="btn btn-primary rounded-full btn-sm text-white px-4"
            >
              {isPending ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
        {isError && <div className="text-red-500">{error.message}</div>}
        {!isImgSizeAllowed && (
          <div className="text-red-500">
            file size must not be greater than to 5MB
          </div>
        )}
      </form>
    </div>
  );
};
export default CreatePost;
