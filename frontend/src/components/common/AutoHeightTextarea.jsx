import React from "react";

function AutoHeightTextarea({ inputRef, text, textSetter, placeholder }) {
  return (
    <div className="max-h-[35vh] overflow-auto w-full">
      <textarea
        className="textarea w-full p-0 text-lg input-style resize-none border-none focus:outline-none"
        placeholder={placeholder}
        ref={inputRef}
        rows={2}
        value={text}
        onChange={(e) => {
          textSetter(e.target.value);
        }}
      />
    </div>
  );
}

export default AutoHeightTextarea;
