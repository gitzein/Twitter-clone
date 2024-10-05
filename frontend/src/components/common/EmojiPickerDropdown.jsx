import EmojiPicker from "emoji-picker-react";
import React, { useState } from "react";
import { BsEmojiSmile } from "react-icons/bs";

function EmojiPickerDropdown({
  setter,
  posClass,
  width = "20rem",
  height = "25rem",
}) {
  const [showPicker, setShowPicker] = useState(false);

  const onEmojiClick = (emojiObject, event) => {
    setter((prevInput) => prevInput + emojiObject.emoji);
    //setShowPicker(false);
  };

  return (
    <div className={"dropdown " + posClass}>
      <div
        tabIndex={0}
        role="button"
        onClick={() => setShowPicker(!showPicker)}
      >
        <BsEmojiSmile className=" w-5 h-5 text-primary cursor-pointer" />
      </div>
      <div
        tabIndex={0}
        className="dropdown-content card card-compact text-primary-content z-[1] w-64 p-2 shadow"
      >
        {showPicker && (
          <EmojiPicker
            theme="dark"
            onEmojiClick={onEmojiClick}
            style={{ width: width, height: height }}
            emojiStyle="twitter"
            lazyLoadEmojis={true}
            autoFocusSearch={false}
            previewConfig={{ showPreview: false }}
            className="card-body"
          />
        )}
      </div>
    </div>
  );
}

export default EmojiPickerDropdown;
