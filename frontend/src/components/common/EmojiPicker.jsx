import React, { useState } from "react";
import Picker from "@emoji-mart/react";
import emojiData from "@emoji-mart/data";
import { BsEmojiSmile } from "react-icons/bs";

function EmojiPicker({ setter, posClass }) {
  const [showPicker, setShowPicker] = useState(false);

  const addEmoji = (e) => {
    let sym = e.unified.split("-");
    let codesArray = [];
    sym.forEach((el) => codesArray.push("0x" + el));
    let emoji = String.fromCodePoint(...codesArray);
    setter((prevInput) => prevInput + emoji);
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
      <div tabIndex={0} className="dropdown-content">
        <div className="shadow-lg shadow-secondary ">
          {showPicker && (
            <Picker data={emojiData} onEmojiSelect={addEmoji} theme="dark" />
          )}
        </div>
      </div>
    </div>
  );
}

export default EmojiPicker;
